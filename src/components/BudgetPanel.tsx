"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown } from "lucide-react";
import { BudgetData, setBudget, setSpent } from "@/actions/budget";
import { ChecklistCategory } from "@/lib/types";

interface BudgetPanelProps {
  categories: ChecklistCategory[];
  initialBudgets: BudgetData[];
}

/** 만원 단위로 포맷 */
function formatKRW(amount: number): string {
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}억`;
  if (amount >= 1) return `${amount.toLocaleString()}만원`;
  return "0원";
}

/** 예산 관리 패널 */
export function BudgetPanel({ categories, initialBudgets }: BudgetPanelProps) {
  const [budgets, setBudgets] = useState<Map<string, BudgetData>>(() => {
    const map = new Map<string, BudgetData>();
    for (const b of initialBudgets) map.set(b.categoryId, b);
    return map;
  });
  const [expanded, setExpanded] = useState(false);

  const totalBudget = Array.from(budgets.values()).reduce(
    (s, b) => s + b.budget,
    0
  );
  const totalSpent = Array.from(budgets.values()).reduce(
    (s, b) => s + b.spent,
    0
  );
  const totalPercent =
    totalBudget === 0 ? 0 : Math.min(100, Math.round((totalSpent / totalBudget) * 100));

  const handleBudgetChange = useCallback(
    (categoryId: string, value: number) => {
      setBudgets((prev) => {
        const next = new Map(prev);
        const existing = next.get(categoryId) ?? {
          categoryId,
          budget: 0,
          spent: 0,
          note: "",
        };
        next.set(categoryId, { ...existing, budget: value });
        return next;
      });
      void setBudget(categoryId, value);
    },
    []
  );

  const handleSpentChange = useCallback(
    (categoryId: string, value: number) => {
      setBudgets((prev) => {
        const next = new Map(prev);
        const existing = next.get(categoryId) ?? {
          categoryId,
          budget: 0,
          spent: 0,
          note: "",
        };
        next.set(categoryId, { ...existing, spent: value });
        return next;
      });
      void setSpent(categoryId, value);
    },
    []
  );

  return (
    <Card>
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            예산 관리
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {formatKRW(totalSpent)} / {formatKRW(totalBudget)}
            </Badge>
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform ${
                expanded ? "" : "-rotate-90"
              }`}
            />
          </div>
        </div>
        <Progress value={totalPercent} className="mt-2" />
        {totalBudget > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            잔여: {formatKRW(totalBudget - totalSpent)} ({100 - totalPercent}%)
          </p>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {categories.map((cat) => {
            const data = budgets.get(cat.id) ?? {
              categoryId: cat.id,
              budget: 0,
              spent: 0,
              note: "",
            };
            const percent =
              data.budget === 0
                ? 0
                : Math.min(100, Math.round((data.spent / data.budget) * 100));
            const overBudget = data.spent > data.budget && data.budget > 0;

            return (
              <div
                key={cat.id}
                className="border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {cat.emoji} {cat.title}
                  </span>
                  {overBudget && (
                    <Badge variant="destructive" className="text-[10px]">
                      초과
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">
                      예산 (만원)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={data.budget || ""}
                      onChange={(e) =>
                        handleBudgetChange(
                          cat.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="border-input bg-background text-foreground w-full rounded-md border px-2 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">
                      지출 (만원)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={data.spent || ""}
                      onChange={(e) =>
                        handleSpentChange(
                          cat.id,
                          parseInt(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className="border-input bg-background text-foreground w-full rounded-md border px-2 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                  </div>
                </div>
                {data.budget > 0 && (
                  <Progress
                    value={percent}
                    className={`mt-2 ${overBudget ? "[&>div]:bg-destructive" : ""}`}
                  />
                )}
              </div>
            );
          })}

          <div className="pt-2 border-t">
            <div className="flex justify-between text-sm font-medium">
              <span>총 예산</span>
              <span>{formatKRW(totalBudget)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">총 지출</span>
              <span
                className={totalSpent > totalBudget && totalBudget > 0 ? "text-destructive" : ""}
              >
                {formatKRW(totalSpent)}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
