import { createClient } from "@/lib/supabase/server";
import { getChecklist, getCategoryOrder } from "@/actions/checklist";
import { getBudgets } from "@/actions/budget";
import { getShares } from "@/actions/share";
import {
  getNotificationSetting,
  getUpcomingDueDates,
} from "@/actions/notification";
import { getWeddingDate } from "@/actions/wedding-date";
import { WeddingChecklist } from "@/components/WeddingChecklist";
import { BudgetPanel } from "@/components/BudgetPanel";
import { SharePanel } from "@/components/SharePanel";
import { NotificationBanner } from "@/components/NotificationBanner";
import { DdayCounter } from "@/components/DdayCounter";
import { UserNav } from "@/components/UserNav";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    categories,
    categoryOrder,
    budgets,
    shares,
    notifSetting,
    alerts,
    weddingDate,
  ] = await Promise.all([
    getChecklist(),
    getCategoryOrder(),
    getBudgets(),
    getShares(),
    getNotificationSetting(),
    getUpcomingDueDates(),
    getWeddingDate(),
  ]);

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);
  const checkedItems = categories.reduce(
    (s, c) => s + c.items.filter((i) => i.checked).length,
    0
  );
  const progress =
    totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="flex justify-end items-center gap-2 mb-4">
          {user && <UserNav email={user.email ?? ""} />}
          <ThemeToggle />
        </div>

        <div className="space-y-4 mb-8">
          <DdayCounter initialDate={weddingDate} progress={progress} />
          <NotificationBanner alerts={alerts} initialSetting={notifSetting} />
          <div className="grid gap-4 sm:grid-cols-2">
            <BudgetPanel categories={categories} initialBudgets={budgets} />
            <SharePanel initialShares={shares} />
          </div>
        </div>

        <WeddingChecklist
          initialCategories={categories}
          initialCategoryOrder={categoryOrder}
        />
      </div>
    </main>
  );
}
