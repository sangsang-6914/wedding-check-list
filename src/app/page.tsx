import { createClient } from "@/lib/supabase/server";
import { getChecklist } from "@/actions/checklist";
import { WeddingChecklist } from "@/components/WeddingChecklist";
import { UserNav } from "@/components/UserNav";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const categories = await getChecklist();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <div className="flex justify-end items-center gap-2 mb-4">
          {user && <UserNav email={user.email ?? ""} />}
          <ThemeToggle />
        </div>
        <WeddingChecklist initialCategories={categories} />
      </div>
    </main>
  );
}
