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

async function getUserEmail(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.email) throw new Error("Unauthorized");
  return session.user.email;
}

export interface ShareInfo {
  id: string;
  partnerEmail: string;
  status: "pending" | "accepted" | "rejected";
  isOwner: boolean;
}

/** 현재 유저의 공유 목록 조회 (내가 보낸 초대 + 나에게 온 초대) */
export async function getShares(): Promise<ShareInfo[]> {
  const userId = await getUserId();
  const email = await getUserEmail();

  const [sentShares, receivedShares] = await Promise.all([
    prisma.sharedChecklist.findMany({
      where: { ownerId: userId },
    }),
    prisma.sharedChecklist.findMany({
      where: { partnerEmail: email },
    }),
  ]);

  const sent: ShareInfo[] = sentShares.map((s) => ({
    id: s.id,
    partnerEmail: s.partnerEmail,
    status: s.status as ShareInfo["status"],
    isOwner: true,
  }));

  const received: ShareInfo[] = receivedShares.map((s) => ({
    id: s.id,
    partnerEmail: s.ownerId,
    status: s.status as ShareInfo["status"],
    isOwner: false,
  }));

  return [...sent, ...received];
}

/** 파트너에게 체크리스트 공유 초대 */
export async function invitePartner(
  partnerEmail: string
): Promise<ShareInfo> {
  const userId = await getUserId();
  const myEmail = await getUserEmail();

  const trimmed = partnerEmail.trim().toLowerCase();
  if (!trimmed) throw new Error("이메일을 입력해주세요");
  if (trimmed === myEmail) throw new Error("본인에게는 초대할 수 없습니다");

  const result = await prisma.sharedChecklist.upsert({
    where: { ownerId_partnerEmail: { ownerId: userId, partnerEmail: trimmed } },
    update: { status: "pending" },
    create: { ownerId: userId, partnerEmail: trimmed, status: "pending" },
  });

  return {
    id: result.id,
    partnerEmail: result.partnerEmail,
    status: result.status as ShareInfo["status"],
    isOwner: true,
  };
}

/** 공유 초대 수락 */
export async function acceptInvite(shareId: string): Promise<void> {
  const userId = await getUserId();
  const email = await getUserEmail();

  await prisma.sharedChecklist.updateMany({
    where: { id: shareId, partnerEmail: email },
    data: { status: "accepted", partnerUserId: userId },
  });
}

/** 공유 초대 거절 */
export async function rejectInvite(shareId: string): Promise<void> {
  const email = await getUserEmail();

  await prisma.sharedChecklist.updateMany({
    where: { id: shareId, partnerEmail: email },
    data: { status: "rejected" },
  });
}

/** 공유 삭제 (소유자만) */
export async function removeShare(shareId: string): Promise<void> {
  const userId = await getUserId();
  await prisma.sharedChecklist.deleteMany({
    where: { id: shareId, ownerId: userId },
  });
}
