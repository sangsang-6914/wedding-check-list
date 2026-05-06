"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CHECKLIST } from "@/lib/data";
import { ChecklistCategory } from "@/lib/types";
import {
  isValidIsoDateString,
  isoDateStringToPrismaDate,
  prismaDateToIsoDate,
} from "@/lib/checklist-dates";

/** 쿠키의 세션에서 유저 ID를 읽는 헬퍼 (미들웨어에서 이미 인증 검증 완료) */
async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

/** DB에서 유저의 체크리스트 상태를 조회하여 카테고리 데이터에 병합 */
export async function getChecklist(): Promise<ChecklistCategory[]> {
  const userId = await getUserId();

  const [rows, customItems] = await Promise.all([
    prisma.checklistItem.findMany({
      where: { userId },
      select: { itemId: true, checked: true, dueDate: true, memo: true },
    }),
    prisma.customItem.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const stateMap = new Map(
    rows.map((row) => [
      row.itemId,
      {
        checked: row.checked,
        dueDate: row.dueDate ? prismaDateToIsoDate(row.dueDate) : null,
        memo: row.memo ?? "",
      },
    ])
  );

  const customByCategory = new Map<string, typeof customItems>();
  for (const ci of customItems) {
    const arr = customByCategory.get(ci.categoryId) ?? [];
    arr.push(ci);
    customByCategory.set(ci.categoryId, arr);
  }

  return DEFAULT_CHECKLIST.map((category) => {
    const defaultItems = category.items.map((item) => {
      const saved = stateMap.get(item.id);
      return {
        ...item,
        checked: saved?.checked ?? false,
        dueDate: saved?.dueDate ?? null,
        memo: saved?.memo ?? "",
      };
    });

    const customs = (customByCategory.get(category.id) ?? []).map((ci) => {
      const saved = stateMap.get(ci.id);
      return {
        id: ci.id,
        label: ci.label,
        checked: saved?.checked ?? false,
        dueDate: saved?.dueDate ?? null,
        memo: saved?.memo ?? "",
        isCustom: true as const,
      };
    });

    return { ...category, items: [...defaultItems, ...customs] };
  });
}

/** 체크리스트 항목의 체크 상태를 토글 */
export async function toggleChecklistItem(
  categoryId: string,
  itemId: string,
  newChecked: boolean
): Promise<{ checked: boolean }> {
  const userId = await getUserId();

  const result = await prisma.checklistItem.upsert({
    where: { userId_itemId: { userId, itemId } },
    update: { checked: newChecked },
    create: { userId, categoryId, itemId, checked: newChecked },
  });

  return { checked: result.checked };
}

/** 항목 마감일 설정(빈 문자열/null이면 제거) */
export async function setChecklistItemDueDate(
  categoryId: string,
  itemId: string,
  dueDate: string | null
): Promise<{ dueDate: string | null }> {
  const userId = await getUserId();

  const normalized =
    dueDate && dueDate.length > 0
      ? isValidIsoDateString(dueDate)
        ? dueDate
        : null
      : null;

  const prismaDue = normalized ? isoDateStringToPrismaDate(normalized) : null;

  const result = await prisma.checklistItem.upsert({
    where: { userId_itemId: { userId, itemId } },
    update: { dueDate: prismaDue, categoryId },
    create: {
      userId,
      categoryId,
      itemId,
      checked: false,
      dueDate: prismaDue,
    },
  });

  return {
    dueDate: result.dueDate ? prismaDateToIsoDate(result.dueDate) : null,
  };
}

/** 항목 메모 저장 */
export async function setChecklistItemMemo(
  categoryId: string,
  itemId: string,
  memo: string
): Promise<{ memo: string }> {
  const userId = await getUserId();

  const result = await prisma.checklistItem.upsert({
    where: { userId_itemId: { userId, itemId } },
    update: { memo, categoryId },
    create: { userId, categoryId, itemId, checked: false, memo },
  });

  return { memo: result.memo ?? "" };
}

/** 사용자 커스텀 항목 추가 */
export async function addCustomItem(
  categoryId: string,
  label: string
): Promise<{ id: string; label: string }> {
  const userId = await getUserId();
  const trimmed = label.trim();
  if (!trimmed) throw new Error("항목 이름이 비어 있습니다");

  const item = await prisma.customItem.create({
    data: { userId, categoryId, label: trimmed },
  });

  return { id: item.id, label: item.label };
}

/** 사용자 커스텀 항목 삭제 */
export async function deleteCustomItem(itemId: string): Promise<void> {
  const userId = await getUserId();

  await Promise.all([
    prisma.customItem.deleteMany({ where: { id: itemId, userId } }),
    prisma.checklistItem.deleteMany({ where: { itemId, userId } }),
  ]);
}

/** 유저의 카테고리 순서 조회 (빈 배열이면 기본 순서) */
export async function getCategoryOrder(): Promise<string[]> {
  const userId = await getUserId();

  const pref = await prisma.userPreference.findUnique({
    where: { userId },
    select: { categoryOrder: true },
  });

  return pref?.categoryOrder ?? [];
}

/** 유저의 카테고리 순서 저장 */
export async function saveCategoryOrder(order: string[]): Promise<void> {
  const userId = await getUserId();

  await prisma.userPreference.upsert({
    where: { userId },
    update: { categoryOrder: order },
    create: { userId, categoryOrder: order },
  });
}

/** 유저의 체크리스트를 전체 초기화 (커스텀 항목 포함) */
export async function resetChecklist(): Promise<void> {
  const userId = await getUserId();
  await Promise.all([
    prisma.checklistItem.deleteMany({ where: { userId } }),
    prisma.customItem.deleteMany({ where: { userId } }),
  ]);
}
