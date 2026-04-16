"use client";

import { useChecklist } from "@/hooks/useChecklist";
import { ProgressHeader } from "./ProgressHeader";
import { CategoryCard } from "./CategoryCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/** 웨딩 체크리스트 메인 클라이언트 컴포넌트 */
export function WeddingChecklist() {
  const {
    categories,
    mounted,
    handleToggle,
    handleReset,
    totalItems,
    checkedItems,
    progress,
  } = useChecklist();

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProgressHeader
        checkedItems={checkedItems}
        totalItems={totalItems}
        progress={progress}
      />

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onToggle={handleToggle}
          />
        ))}
      </div>

      <div className="flex justify-center pt-4 pb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="text-muted-foreground hover:text-destructive hover:border-destructive"
        >
          초기화
        </Button>
      </div>
    </div>
  );
}
