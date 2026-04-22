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

  const rows = await prisma.checklistItem.findMany({
    where: { userId },
    select: { itemId: true, checked: true, dueDate: true },
  });

  const stateMap = new Map(
    rows.map((row) => [
      row.itemId,
      {
        checked: row.checked,
        dueDate: row.dueDate ? prismaDateToIsoDate(row.dueDate) : null,
      },
    ])
  );

  return DEFAULT_CHECKLIST.map((category) => ({
    ...category,
    items: category.items.map((item) => {
      const saved = stateMap.get(item.id);
      return {
        ...item,
        checked: saved?.checked ?? false,
        dueDate: saved?.dueDate ?? null,
      };
    }),
  }));
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

/** 유저의 체크리스트를 전체 초기화 */
export async function resetChecklist(): Promise<void> {
  const userId = await getUserId();
  await prisma.checklistItem.deleteMany({ where: { userId } });
}
