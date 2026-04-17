"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CHECKLIST } from "@/lib/data";
import { ChecklistCategory } from "@/lib/types";

/** 현재 로그인한 유저 ID를 가져오는 헬퍼 */
async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

/** DB에서 유저의 체크리스트 상태를 조회하여 카테고리 데이터에 병합 */
export async function getChecklist(): Promise<ChecklistCategory[]> {
  const userId = await getUserId();

  const checkedItems = await prisma.checklistItem.findMany({
    where: { userId },
    select: { itemId: true, checked: true }
  })

  const checkedMap = new Map(
    checkedItems.map((item) => [item.itemId, item.checked])
  );

  return DEFAULT_CHECKLIST.map((category) => ({
    ...category,
    items: category.items.map((item) => ({
      ...item,
      checked: checkedMap.get(item.id) ?? false,
    })),
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

/** 유저의 체크리스트를 전체 초기화 */
export async function resetChecklist(): Promise<void> {
  const userId = await getUserId();
  await prisma.checklistItem.deleteMany({ where: { userId } });
}
