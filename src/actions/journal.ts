"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  isoDateStringToPrismaDate,
  prismaDateToIsoDate,
} from "@/lib/checklist-dates";

export interface JournalEntryDTO {
  id: string;
  date: string;
  content: string;
}

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

/** 유저의 전체 일지를 날짜 내림차순으로 조회 */
export async function getJournalEntries(): Promise<JournalEntryDTO[]> {
  const userId = await getUserId();

  const rows = await prisma.journalEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  return rows.map((r) => ({
    id: r.id,
    date: prismaDateToIsoDate(r.date),
    content: r.content,
  }));
}

/** 새 일지 항목 생성 */
export async function addJournalEntry(
  date: string,
  content: string
): Promise<JournalEntryDTO> {
  const userId = await getUserId();
  const trimmed = content.trim();
  if (!trimmed) throw new Error("내용이 비어 있습니다");

  const entry = await prisma.journalEntry.create({
    data: {
      userId,
      date: isoDateStringToPrismaDate(date),
      content: trimmed,
    },
  });

  return {
    id: entry.id,
    date: prismaDateToIsoDate(entry.date),
    content: entry.content,
  };
}

/** 일지 항목 수정 */
export async function updateJournalEntry(
  id: string,
  content: string
): Promise<JournalEntryDTO> {
  const userId = await getUserId();
  const trimmed = content.trim();
  if (!trimmed) throw new Error("내용이 비어 있습니다");

  const entry = await prisma.journalEntry.updateMany({
    where: { id, userId },
    data: { content: trimmed },
  });

  if (entry.count === 0) throw new Error("항목을 찾을 수 없습니다");

  const updated = await prisma.journalEntry.findUnique({ where: { id } });
  if (!updated) throw new Error("항목을 찾을 수 없습니다");

  return {
    id: updated.id,
    date: prismaDateToIsoDate(updated.date),
    content: updated.content,
  };
}

/** 일지 항목 삭제 */
export async function deleteJournalEntry(id: string): Promise<void> {
  const userId = await getUserId();
  await prisma.journalEntry.deleteMany({ where: { id, userId } });
}
