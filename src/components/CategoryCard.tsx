"use client";

import { useState } from "react";
import { ChecklistCategory } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { getDueDayMeta } from "@/lib/checklist-dates";
import { StickyNote } from "lucide-react";

interface CategoryCardProps {
  category: ChecklistCategory;
  onToggle: (categoryId: string, itemId: string) => void;
  onDueDateChange: (
    categoryId: string,
    itemId: string,
    value: string | null
  ) => void;
  onMemoChange: (categoryId: string, itemId: string, value: string) => void;
  onMemoBlur: (categoryId: string, itemId: string, value: string) => void;
}

/** 카테고리별 체크리스트 카드 컴포넌트 */
export function CategoryCard({
  category,
  onToggle,
  onDueDateChange,
  onMemoChange,
  onMemoBlur,
}: CategoryCardProps) {
  const [openMemos, setOpenMemos] = useState<Set<string>>(
    () => new Set(category.items.filter((i) => i.memo).map((i) => i.id))
  );
  const checked = category.items.filter((i) => i.checked).length;
  const total = category.items.length;
  const allDone = checked === total;

  return (
    <Card
      className={`transition-all duration-300 ${
        allDone
          ? "border-primary/30 bg-primary/5 shadow-sm"
          : "hover:shadow-md"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 min-w-0">
            <span className="text-xl shrink-0">{category.emoji}</span>
            <span className="truncate">{category.title}</span>
          </CardTitle>
          <Badge
            variant={allDone ? "default" : "outline"}
            className="text-xs shrink-0"
          >
            {checked}/{total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {category.items.map((item) => {
          const checkId = `check-${category.id}-${item.id}`;
          const dueInputId = `due-${category.id}-${item.id}`;
          const memoInputId = `memo-${category.id}-${item.id}`;
          const dueMeta = item.dueDate ? getDueDayMeta(item.dueDate) : null;
          const memoOpen = openMemos.has(item.id);

          function handleToggleMemo() {
            setOpenMemos((prev) => {
              const next = new Set(prev);
              if (next.has(item.id)) next.delete(item.id);
              else next.add(item.id);
              return next;
            });
          }

          return (
            <div
              key={item.id}
              className="border-b border-border/60 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <Checkbox
                    id={checkId}
                    checked={item.checked}
                    onCheckedChange={() => onToggle(category.id, item.id)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={checkId}
                    className={`cursor-pointer text-sm leading-snug ${
                      item.checked
                        ? "line-through text-muted-foreground"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {item.label}
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-7 sm:shrink-0 sm:justify-end sm:pl-0">
                  <button
                    type="button"
                    onClick={handleToggleMemo}
                    aria-label={memoOpen ? "메모 닫기" : "메모 열기"}
                    className={`inline-flex size-7 items-center justify-center rounded-md transition-colors ${
                      item.memo
                        ? "text-primary hover:bg-primary/10"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <StickyNote className="size-3.5" />
                  </button>
                  {dueMeta && (
                    <Badge
                      variant={
                        dueMeta.overdue
                          ? "destructive"
                          : dueMeta.soon
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[10px] sm:text-xs"
                    >
                      {dueMeta.text}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Label
                      htmlFor={dueInputId}
                      className="text-muted-foreground text-xs whitespace-nowrap"
                    >
                      마감
                    </Label>
                    <input
                      id={dueInputId}
                      type="date"
                      value={item.dueDate ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        onDueDateChange(
                          category.id,
                          item.id,
                          v === "" ? null : v
                        );
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="border-input bg-background text-foreground max-w-[10.5rem] rounded-md border px-1.5 py-1 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                  </div>
                </div>
              </div>
              {memoOpen && (
                <div className="mt-2 pl-7">
                  <input
                    id={memoInputId}
                    type="text"
                    placeholder="업체명, 가격, 연락처 등 메모..."
                    value={item.memo}
                    onChange={(e) =>
                      onMemoChange(category.id, item.id, e.target.value)
                    }
                    onBlur={(e) =>
                      onMemoBlur(category.id, item.id, e.target.value)
                    }
                    className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-2.5 py-1.5 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
