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

export interface NotificationSettingData {
  enabled: boolean;
  daysBefore: number;
}

/** 알림 설정 조회 */
export async function getNotificationSetting(): Promise<NotificationSettingData> {
  const userId = await getUserId();
  const setting = await prisma.notificationSetting.findUnique({
    where: { userId },
    select: { enabled: true, daysBefore: true },
  });
  return setting ?? { enabled: true, daysBefore: 3 };
}

/** 알림 설정 저장 */
export async function saveNotificationSetting(
  data: NotificationSettingData
): Promise<void> {
  const userId = await getUserId();
  await prisma.notificationSetting.upsert({
    where: { userId },
    update: { enabled: data.enabled, daysBefore: data.daysBefore },
    create: { userId, enabled: data.enabled, daysBefore: data.daysBefore },
  });
}

export interface DueDateAlert {
  categoryId: string;
  categoryTitle: string;
  itemId: string;
  itemLabel: string;
  dueDate: string;
  daysLeft: number;
}

/** 마감일 임박 항목 조회 */
export async function getUpcomingDueDates(): Promise<DueDateAlert[]> {
  const userId = await getUserId();

  const setting = await prisma.notificationSetting.findUnique({
    where: { userId },
    select: { enabled: true, daysBefore: true },
  });

  if (setting && !setting.enabled) return [];
  const daysBefore = setting?.daysBefore ?? 3;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(today);
  deadline.setDate(deadline.getDate() + daysBefore);

  const items = await prisma.checklistItem.findMany({
    where: {
      userId,
      checked: false,
      dueDate: { gte: today, lte: deadline },
    },
    select: { categoryId: true, itemId: true, dueDate: true },
  });

  if (items.length === 0) return [];

  const { DEFAULT_CHECKLIST } = await import("@/lib/data");
  const customItems = await prisma.customItem.findMany({
    where: { userId },
    select: { id: true, label: true, categoryId: true },
  });

  const customMap = new Map(customItems.map((ci) => [ci.id, ci]));

  return items
    .map((item) => {
      const category = DEFAULT_CHECKLIST.find((c) => c.id === item.categoryId);
      const defaultItem = category?.items.find((i) => i.id === item.itemId);
      const custom = customMap.get(item.itemId);

      const label = defaultItem?.label ?? custom?.label ?? "알 수 없는 항목";
      const categoryTitle = category?.title ?? "기타";

      const dueDate = item.dueDate!;
      const daysLeft = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        categoryId: item.categoryId,
        categoryTitle,
        itemId: item.itemId,
        itemLabel: label,
        dueDate: dueDate.toISOString().split("T")[0],
        daysLeft,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);
}
