"use client";

import {
  useChecklist,
  type ChecklistSortMode,
} from "@/hooks/useChecklist";
import { ProgressHeader } from "./ProgressHeader";
import { CategoryCard } from "./CategoryCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChecklistCategory } from "@/lib/types";

interface WeddingChecklistProps {
  initialCategories: ChecklistCategory[];
}

/** 웨딩 체크리스트 메인 클라이언트 컴포넌트 */
export function WeddingChecklist({ initialCategories }: WeddingChecklistProps) {
  const {
    categories,
    sortMode,
    setSortMode,
    handleToggle,
    handleDueDateChange,
    handleReset,
    totalItems,
    checkedItems,
    progress,
  } = useChecklist(initialCategories);

  return (
    <div className="space-y-8">
      <ProgressHeader
        checkedItems={checkedItems}
        totalItems={totalItems}
        progress={progress}
      />

      <div className="flex flex-col items-stretch justify-end gap-2 sm:flex-row sm:items-center sm:justify-end">
        <label
          htmlFor="checklist-sort"
          className="text-muted-foreground text-sm whitespace-nowrap"
        >
          정렬
        </label>
        <select
          id="checklist-sort"
          value={sortMode}
          onChange={(e) =>
            setSortMode(e.target.value as ChecklistSortMode)
          }
          className="border-input bg-background text-foreground h-9 w-full max-w-[220px] rounded-md border px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-auto"
        >
          <option value="default">기본 순서</option>
          <option value="dueSoon">마감일 임박 (카테고리 내)</option>
        </select>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onToggle={handleToggle}
            onDueDateChange={handleDueDateChange}
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
