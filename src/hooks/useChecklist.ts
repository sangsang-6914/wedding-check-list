"use client";

import { useCallback, useState } from "react";
import { ChecklistCategory } from "@/lib/types";
import {
  toggleChecklistItem,
  resetChecklist,
} from "@/actions/checklist";

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

/** DB 기반 체크리스트 상태 관리 훅 */
export function useChecklist(initialCategories: ChecklistCategory[]) {
  const [categories, setCategories] = useState(initialCategories);

  const handleToggle = useCallback(
    (categoryId: string, itemId: string) => {
      let newChecked = true;

      setCategories((prev) => {
        const currentItem = prev
          .find((c) => c.id === categoryId)
          ?.items.find((i) => i.id === itemId);
        newChecked = !currentItem?.checked;
        return updateItemInCategories(prev, categoryId, itemId, newChecked);
      });

      // setState 밖에서 호출하여 UI 블로킹 방지
      toggleChecklistItem(categoryId, itemId, newChecked);
    },
    []
  );

  const handleReset = useCallback(() => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({ ...item, checked: false })),
      }))
    );

    resetChecklist();
  }, []);

  const totalItems = categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );
  const checkedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
    0
  );
  const progress =
    totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  return {
    categories,
    handleToggle,
    handleReset,
    totalItems,
    checkedItems,
    progress,
  };
}
