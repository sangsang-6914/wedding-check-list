"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  isValidIsoDateString,
  isoDateStringToPrismaDate,
  prismaDateToIsoDate,
} from "@/lib/checklist-dates";

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

/** 유저의 결혼식 날짜 조회 */
export async function getWeddingDate(): Promise<string | null> {
  const userId = await getUserId();
  const pref = await prisma.userPreference.findUnique({
    where: { userId },
    select: { weddingDate: true },
  });
  if (!pref?.weddingDate) return null;
  return prismaDateToIsoDate(pref.weddingDate);
}

/** 유저의 결혼식 날짜 저장 (null이면 삭제) */
export async function setWeddingDate(
  date: string | null
): Promise<string | null> {
  const userId = await getUserId();

  const normalized =
    date && date.length > 0 && isValidIsoDateString(date) ? date : null;
  const prismaDate = normalized ? isoDateStringToPrismaDate(normalized) : null;

  await prisma.userPreference.upsert({
    where: { userId },
    update: { weddingDate: prismaDate },
    create: { userId, categoryOrder: [], weddingDate: prismaDate },
  });

  return normalized;
}
