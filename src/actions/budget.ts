"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

export interface BudgetData {
  categoryId: string;
  budget: number;
  spent: number;
  note: string;
}

/** 유저의 전체 예산 데이터를 조회 */
export async function getBudgets(): Promise<BudgetData[]> {
  const userId = await getUserId();
  const rows = await prisma.budgetItem.findMany({
    where: { userId },
    select: { categoryId: true, budget: true, spent: true, note: true },
  });
  return rows.map((r) => ({
    categoryId: r.categoryId,
    budget: r.budget,
    spent: r.spent,
    note: r.note ?? "",
  }));
}

/** 카테고리별 예산 설정 */
export async function setBudget(
  categoryId: string,
  budget: number
): Promise<BudgetData> {
  const userId = await getUserId();
  const result = await prisma.budgetItem.upsert({
    where: { userId_categoryId: { userId, categoryId } },
    update: { budget },
    create: { userId, categoryId, budget, spent: 0 },
  });
  return {
    categoryId: result.categoryId,
    budget: result.budget,
    spent: result.spent,
    note: result.note ?? "",
  };
}

/** 카테고리별 지출 금액 설정 */
export async function setSpent(
  categoryId: string,
  spent: number
): Promise<BudgetData> {
  const userId = await getUserId();
  const result = await prisma.budgetItem.upsert({
    where: { userId_categoryId: { userId, categoryId } },
    update: { spent },
    create: { userId, categoryId, budget: 0, spent },
  });
  return {
    categoryId: result.categoryId,
    budget: result.budget,
    spent: result.spent,
    note: result.note ?? "",
  };
}

/** 카테고리별 예산 메모 설정 */
export async function setBudgetNote(
  categoryId: string,
  note: string
): Promise<void> {
  const userId = await getUserId();
  await prisma.budgetItem.upsert({
    where: { userId_categoryId: { userId, categoryId } },
    update: { note },
    create: { userId, categoryId, budget: 0, spent: 0, note },
  });
}
