"use client";

import { useCallback, useMemo, useState } from "react";
import { ChecklistCategory } from "@/lib/types";
import { compareDueDatesAsc } from "@/lib/checklist-dates";
import {
  toggleChecklistItem,
  resetChecklist,
  setChecklistItemDueDate,
  setChecklistItemMemo,
} from "@/actions/checklist";

export type ChecklistSortMode = "default" | "dueSoon";
export type ChecklistFilterMode = "all" | "done" | "undone" | "hasDueDate";

/** 카테고리 목록에서 특정 아이템의 checked 값을 변경하는 헬퍼 */
function updateItemInCategories(
  categories: ChecklistCategory[],
  categoryId: string,
  itemId: string,
  checked: boolean
): ChecklistCategory[] {
  return categories.map((cat) =>
    cat.id !== categoryId
      ? cat
      : {
          ...cat,
          items: cat.items.map((item) =>
            item.id !== itemId ? item : { ...item, checked }
          ),
        }
  );
}

/** 특정 항목의 메모만 갱신 */
function updateItemMemo(
  categories: ChecklistCategory[],
  categoryId: string,
  itemId: string,
  memo: string
): ChecklistCategory[] {
  return categories.map((cat) =>
    cat.id !== categoryId
      ? cat
      : {
          ...cat,
          items: cat.items.map((item) =>
            item.id !== itemId ? item : { ...item, memo }
          ),
        }
  );
}

/** 특정 항목의 마감일만 갱신 */
function updateItemDueDate(
  categories: ChecklistCategory[],
  categoryId: string,
  itemId: string,
  dueDate: string | null
): ChecklistCategory[] {
  return categories.map((cat) =>
    cat.id !== categoryId
      ? cat
      : {
          ...cat,
          items: cat.items.map((item) =>
            item.id !== itemId ? item : { ...item, dueDate }
          ),
        }
  );
}

/** 카테고리 내 항목만 정렬(그리드·카테고리 순서는 유지) */
function sortItemsInCategory(
  cat: ChecklistCategory,
  mode: ChecklistSortMode
): ChecklistCategory {
  if (mode === "default") return cat;
  return {
    ...cat,
    items: [...cat.items].sort((a, b) =>
      compareDueDatesAsc(a.dueDate, b.dueDate)
    ),
  };
}

/** 필터 조건에 맞는 항목만 남기기 (빈 카테고리는 숨김) */
function filterCategory(
  cat: ChecklistCategory,
  query: string,
  filter: ChecklistFilterMode
): ChecklistCategory | null {
  const q = query.trim().toLowerCase();
  const filtered = cat.items.filter((item) => {
    if (
      q &&
      !item.label.toLowerCase().includes(q) &&
      !item.memo.toLowerCase().includes(q)
    )
      return false;
    if (filter === "done" && !item.checked) return false;
    if (filter === "undone" && item.checked) return false;
    if (filter === "hasDueDate" && !item.dueDate) return false;
    return true;
  });
  if (filtered.length === 0) return null;
  return { ...cat, items: filtered };
}

/** 체크리스트를 마크다운 문자열로 변환 (클립보드 내보내기용) */
export function generateMarkdown(categories: ChecklistCategory[]): string {
  const blocks: string[] = [];
  for (const cat of categories) {
    const itemLines = cat.items.map((item) => {
      const mark = item.checked ? "[x]" : "[ ]";
      let line = `- ${mark} ${item.label}`;
      if (item.dueDate) {
        line += ` (마감: ${item.dueDate})`;
      }
      if (item.memo) {
        line += `\n  > ${item.memo}`;
      }
      return line;
    });
    blocks.push(`## ${cat.emoji} ${cat.title}\n\n${itemLines.join("\n")}`);
  }
  return blocks.join("\n\n");
}

/** DB 기반 체크리스트 상태 관리 훅 */
export function useChecklist(initialCategories: ChecklistCategory[]) {
  const [baseCategories, setBaseCategories] = useState(initialCategories);
  const [sortMode, setSortMode] = useState<ChecklistSortMode>("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<ChecklistFilterMode>("all");

  const categories = useMemo(() => {
    const sorted = baseCategories.map((c) => sortItemsInCategory(c, sortMode));
    if (!searchQuery.trim() && filterMode === "all") return sorted;
    return sorted
      .map((c) => filterCategory(c, searchQuery, filterMode))
      .filter((c): c is ChecklistCategory => c !== null);
  }, [baseCategories, sortMode, searchQuery, filterMode]);

  const handleToggle = useCallback(
    (categoryId: string, itemId: string) => {
      let newChecked = true;

      setBaseCategories((prev) => {
        const currentItem = prev
          .find((c) => c.id === categoryId)
          ?.items.find((i) => i.id === itemId);
        newChecked = !currentItem?.checked;
        return updateItemInCategories(prev, categoryId, itemId, newChecked);
      });

      toggleChecklistItem(categoryId, itemId, newChecked);
    },
    []
  );

  const handleDueDateChange = useCallback(
    (categoryId: string, itemId: string, value: string | null) => {
      let previousDueDate: string | null = null;
      setBaseCategories((prev) => {
        previousDueDate =
          prev
            .find((c) => c.id === categoryId)
            ?.items.find((i) => i.id === itemId)?.dueDate ?? null;
        return updateItemDueDate(prev, categoryId, itemId, value);
      });

      void setChecklistItemDueDate(categoryId, itemId, value).catch(() => {
        setBaseCategories((prev) =>
          updateItemDueDate(prev, categoryId, itemId, previousDueDate)
        );
      });
    },
    []
  );

  const handleMemoChange = useCallback(
    (categoryId: string, itemId: string, value: string) => {
      setBaseCategories((prev) =>
        updateItemMemo(prev, categoryId, itemId, value)
      );
    },
    []
  );

  const handleMemoBlur = useCallback(
    (categoryId: string, itemId: string, value: string) => {
      void setChecklistItemMemo(categoryId, itemId, value);
    },
    []
  );

  const handleReset = useCallback(() => {
    setBaseCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({
          ...item,
          checked: false,
          dueDate: null,
          memo: "",
        })),
      }))
    );

    resetChecklist();
  }, []);

  const totalItems = baseCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );
  const checkedItems = baseCategories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
    0
  );
  const progress =
    totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  return {
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
    handleReset,
    totalItems,
    checkedItems,
    progress,
  };
}
