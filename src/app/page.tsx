import { WeddingChecklist } from "@/components/WeddingChecklist";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <WeddingChecklist />
      </div>
    </main>
  );
}
