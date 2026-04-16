"use client";

import { useCallback, useEffect, useState } from "react";
import { ChecklistCategory } from "@/lib/types";
import { DEFAULT_CHECKLIST } from "@/lib/data";

const STORAGE_KEY = "wedding-checklist";

/** localStorage에서 체크리스트를 로드/저장하는 커스텀 훅 */
export function useChecklist() {
  const [categories, setCategories] = useState<ChecklistCategory[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCategories(JSON.parse(saved));
      } catch {
        setCategories(DEFAULT_CHECKLIST);
      }
    } else {
      setCategories(DEFAULT_CHECKLIST);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories, mounted]);

  const handleToggle = useCallback((categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
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
  }, []);

  const handleReset = useCallback(() => {
    setCategories(DEFAULT_CHECKLIST);
  }, []);

  const totalItems = categories.reduce(
    (sum, cat) => sum + cat.items.length,
    0
  );
  const checkedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter((i) => i.checked).length,
    0
  );
  const progress = totalItems === 0 ? 0 : Math.round((checkedItems / totalItems) * 100);

  return {
    categories,
    mounted,
    handleToggle,
    handleReset,
    totalItems,
    checkedItems,
    progress,
  };
}
