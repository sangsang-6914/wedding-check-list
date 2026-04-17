"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
import { ChecklistCategory } from "@/lib/types";
import {
  toggleChecklistItem,
  resetChecklist,
} from "@/actions/checklist";

/** DB 기반 체크리스트 상태 관리 훅 */
export function useChecklist(initialCategories: ChecklistCategory[]) {
  const [categories, setCategories] = useState(initialCategories);
  const [isPending, startTransition] = useTransition();

  const [optimisticCategories, applyOptimistic] = useOptimistic(
    categories,
    (
      state: ChecklistCategory[],
      { categoryId, itemId }: { categoryId: string; itemId: string }
    ) =>
      state.map((cat) =>
        cat.id !== categoryId
          ? cat
          : {
              ...cat,
              items: cat.items.map((item) =>
                item.id !== itemId
                  ? item
                  : { ...item, checked: !item.checked }
              ),
            }
      )
  );

  const handleToggle = useCallback(
    (categoryId: string, itemId: string) => {
      const currentItem = categories
        .find((c) => c.id === categoryId)
        ?.items.find((i) => i.id === itemId);
      const newChecked = !currentItem?.checked;

      startTransition(async () => {
        applyOptimistic({ categoryId, itemId });
        await toggleChecklistItem(categoryId, itemId, newChecked);
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id !== categoryId
              ? cat
              : {
                  ...cat,
                  items: cat.items.map((item) =>
                    item.id !== itemId
                      ? item
                      : { ...item, checked: newChecked }
                  ),
                }
          )
        );
      });
    },
    [startTransition, applyOptimistic, categories]
  );

  const handleReset = useCallback(() => {
    startTransition(async () => {
      await resetChecklist();
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((item) => ({ ...item, checked: false })),
        }))
      );
    });
  }, [startTransition]);

  const totalItems = optimisticCategories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );
  const checkedItems = optimisticCategories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
    0
  );
  const progress =
    totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  return {
    categories: optimisticCategories,
    handleToggle,
    handleReset,
    totalItems,
    checkedItems,
    progress,
    isPending,
  };
}
