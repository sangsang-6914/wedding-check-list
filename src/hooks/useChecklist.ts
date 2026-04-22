"use client";

import { useCallback, useMemo, useState } from "react";
import { ChecklistCategory } from "@/lib/types";
import { compareDueDatesAsc } from "@/lib/checklist-dates";
import {
  toggleChecklistItem,
  resetChecklist,
  setChecklistItemDueDate,
} from "@/actions/checklist";

export type ChecklistSortMode = "default" | "dueSoon";

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

/** DB 기반 체크리스트 상태 관리 훅 */
export function useChecklist(initialCategories: ChecklistCategory[]) {
  const [baseCategories, setBaseCategories] = useState(initialCategories);
  const [sortMode, setSortMode] = useState<ChecklistSortMode>("default");

  const categories = useMemo(
    () => baseCategories.map((c) => sortItemsInCategory(c, sortMode)),
    [baseCategories, sortMode]
  );

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

  const handleReset = useCallback(() => {
    setBaseCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({
          ...item,
          checked: false,
          dueDate: null,
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
    sortMode,
    setSortMode,
    handleToggle,
    handleDueDateChange,
    handleReset,
    totalItems,
    checkedItems,
    progress,
  };
}
