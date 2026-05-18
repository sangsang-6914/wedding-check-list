"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type GuestSide = "groom" | "bride";
export type AttendingStatus = "pending" | "yes" | "no";

export interface GuestDTO {
  id: string;
  name: string;
  side: GuestSide;
  relation: string;
  attending: AttendingStatus;
  plusCount: number;
  needsMeal: boolean;
  note: string;
}

async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

function toDTO(row: {
  id: string;
  name: string;
  side: string;
  relation: string;
  attending: string;
  plusCount: number;
  needsMeal: boolean;
  note: string | null;
}): GuestDTO {
  return {
    id: row.id,
    name: row.name,
    side: row.side as GuestSide,
    relation: row.relation,
    attending: row.attending as AttendingStatus,
    plusCount: row.plusCount,
    needsMeal: row.needsMeal,
    note: row.note ?? "",
  };
}

/** 전체 하객 목록 조회 (이름순) */
export async function getGuests(): Promise<GuestDTO[]> {
  const userId = await getUserId();
  const rows = await prisma.guest.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
  return rows.map(toDTO);
}

/** 하객 추가 */
export async function addGuest(
  data: Omit<GuestDTO, "id">
): Promise<GuestDTO> {
  const userId = await getUserId();
  const row = await prisma.guest.create({
    data: {
      userId,
      name: data.name.trim(),
      side: data.side,
      relation: data.relation.trim(),
      attending: data.attending,
      plusCount: data.plusCount,
      needsMeal: data.needsMeal,
      note: data.note.trim(),
    },
  });
  return toDTO(row);
}

/** 하객 수정 */
export async function updateGuest(
  id: string,
  data: Partial<Omit<GuestDTO, "id">>
): Promise<GuestDTO> {
  const userId = await getUserId();
  const result = await prisma.guest.updateMany({
    where: { id, userId },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.side !== undefined && { side: data.side }),
      ...(data.relation !== undefined && { relation: data.relation.trim() }),
      ...(data.attending !== undefined && { attending: data.attending }),
      ...(data.plusCount !== undefined && { plusCount: data.plusCount }),
      ...(data.needsMeal !== undefined && { needsMeal: data.needsMeal }),
      ...(data.note !== undefined && { note: data.note.trim() }),
    },
  });
  if (result.count === 0) throw new Error("하객을 찾을 수 없습니다");

  const updated = await prisma.guest.findUnique({ where: { id } });
  if (!updated) throw new Error("하객을 찾을 수 없습니다");
  return toDTO(updated);
}

/** 하객 삭제 */
export async function deleteGuest(id: string): Promise<void> {
  const userId = await getUserId();
  await prisma.guest.deleteMany({ where: { id, userId } });
}
