"use client";

import { useCallback, useState } from "react";
import {
  useChecklist,
  generateMarkdown,
  type ChecklistSortMode,
  type ChecklistFilterMode,
} from "@/hooks/useChecklist";
import { ChevronsDownUp, ChevronsUpDown, Copy, Search } from "lucide-react";
import { ProgressHeader } from "./ProgressHeader";
import { SortableCategoryGrid } from "./SortableCategoryGrid";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChecklistCategory } from "@/lib/types";

interface WeddingChecklistProps {
  initialCategories: ChecklistCategory[];
  initialCategoryOrder?: string[];
}

/** 웨딩 체크리스트 메인 클라이언트 컴포넌트 */
export function WeddingChecklist({
  initialCategories,
  initialCategoryOrder = [],
}: WeddingChecklistProps) {
  const {
    categories,
    baseCategories,
    sortMode,
    setSortMode,
    searchQuery,
    setSearchQuery,
    filterMode,
    setFilterMode,
    handleToggle,
    handleDueDateChange,
    handleMemoChange,
    handleMemoBlur,
    handleReorder,
    handleReset,
    totalItems,
    checkedItems,
    progress,
  } = useChecklist(initialCategories, initialCategoryOrder);

  const [exportLabel, setExportLabel] = useState("내보내기");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );

  const handleToggleCollapse = useCallback((categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }, []);

  const allCollapsed =
    categories.length > 0 &&
    collapsedCategories.size >= categories.length;

  const handleToggleAll = useCallback(() => {
    if (allCollapsed) {
      setCollapsedCategories(new Set());
    } else {
      setCollapsedCategories(new Set(categories.map((c) => c.id)));
    }
  }, [allCollapsed, categories]);

  const handleExport = useCallback(async () => {
    const md = generateMarkdown(baseCategories);
    await navigator.clipboard.writeText(md);
    setExportLabel("복사됨!");
    window.setTimeout(() => setExportLabel("내보내기"), 2000);
  }, [baseCategories]);

  return (
    <div className="space-y-8">
      <ProgressHeader
        checkedItems={checkedItems}
        totalItems={totalItems}
        progress={progress}
      />

      <div className="flex flex-col gap-3">
        {/* 검색 */}
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="항목 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-input bg-background text-foreground placeholder:text-muted-foreground h-9 w-full rounded-md border pl-9 pr-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        {/* 필터 + 정렬 + 접기/펼치기 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2">
            <label
              htmlFor="checklist-filter"
              className="text-muted-foreground text-sm whitespace-nowrap"
            >
              필터
            </label>
            <select
              id="checklist-filter"
              value={filterMode}
              onChange={(e) =>
                setFilterMode(e.target.value as ChecklistFilterMode)
              }
              className="border-input bg-background text-foreground h-9 w-full max-w-[180px] rounded-md border px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:w-auto"
            >
              <option value="all">전체</option>
              <option value="done">완료</option>
              <option value="undone">미완료</option>
              <option value="hasDueDate">마감일 있음</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
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

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleAll}
            className="text-muted-foreground h-9 gap-1"
          >
            {allCollapsed ? (
              <ChevronsUpDown className="size-4" />
            ) : (
              <ChevronsDownUp className="size-4" />
            )}
            {allCollapsed ? "모두 펼치기" : "모두 접기"}
          </Button>
        </div>
      </div>

      <Separator />

      {categories.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">
          조건에 맞는 항목이 없습니다.
        </p>
      ) : (
        <SortableCategoryGrid
          categories={categories}
          collapsedCategories={collapsedCategories}
          onToggle={handleToggle}
          onDueDateChange={handleDueDateChange}
          onMemoChange={handleMemoChange}
          onMemoBlur={handleMemoBlur}
          onReorder={handleReorder}
          onToggleCollapse={handleToggleCollapse}
        />
      )}

      <div className="flex flex-wrap justify-center gap-2 pt-4 pb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="text-muted-foreground"
        >
          <Copy />
          {exportLabel}
        </Button>
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
