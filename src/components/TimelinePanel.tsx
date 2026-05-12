"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, ChevronDown, CheckCircle2 } from "lucide-react";
import { ChecklistCategory } from "@/lib/types";

interface TimelinePanelProps {
  weddingDate: string | null;
  categories: ChecklistCategory[];
}

interface TimelinePhase {
  label: string;
  monthsBefore: number;
  categoryIds: string[];
}

const TIMELINE_PHASES: TimelinePhase[] = [
  { label: "6개월 전~", monthsBefore: 6, categoryIds: ["venue", "house"] },
  {
    label: "4~6개월 전",
    monthsBefore: 4,
    categoryIds: ["dress", "photo"],
  },
  {
    label: "3~4개월 전",
    monthsBefore: 3,
    categoryIds: ["makeup", "ring"],
  },
  {
    label: "2~3개월 전",
    monthsBefore: 2,
    categoryIds: ["invitation", "honeymoon"],
  },
  { label: "1개월 전~당일", monthsBefore: 1, categoryIds: ["ceremony"] },
];

/** 결혼식까지 남은 개월 수 계산 */
function getMonthsLeft(weddingDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = weddingDateStr.split("-").map(Number);
  const wedding = new Date(y, m - 1, d);
  const diffMs = wedding.getTime() - today.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 30.44);
}

/** 카테고리별 진행률 계산 */
function getCategoryProgress(
  categories: ChecklistCategory[],
  categoryIds: string[]
): { emoji: string; title: string; checked: number; total: number }[] {
  return categoryIds
    .map((id) => {
      const cat = categories.find((c) => c.id === id);
      if (!cat) return null;
      return {
        emoji: cat.emoji,
        title: cat.title,
        checked: cat.items.filter((i) => i.checked).length,
        total: cat.items.length,
      };
    })
    .filter(
      (v): v is { emoji: string; title: string; checked: number; total: number } =>
        v !== null
    );
}

/** 준비 타임라인 패널 */
export function TimelinePanel({ weddingDate, categories }: TimelinePanelProps) {
  const [expanded, setExpanded] = useState(false);

  const monthsLeft = useMemo(
    () => (weddingDate ? getMonthsLeft(weddingDate) : null),
    [weddingDate]
  );

  const currentPhaseIndex = useMemo(() => {
    if (monthsLeft === null) return -1;
    for (let i = 0; i < TIMELINE_PHASES.length; i++) {
      if (monthsLeft >= TIMELINE_PHASES[i].monthsBefore) return i;
    }
    return TIMELINE_PHASES.length - 1;
  }, [monthsLeft]);

  if (!weddingDate) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex items-center justify-center gap-2 py-5">
          <Clock className="size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            결혼식 날짜를 설정하면 준비 타임라인을 확인할 수 있어요
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            준비 타임라인
          </CardTitle>
          <div className="flex items-center gap-2">
            {currentPhaseIndex >= 0 && (
              <Badge variant="outline" className="text-xs">
                {TIMELINE_PHASES[currentPhaseIndex].label}
              </Badge>
            )}
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform ${
                expanded ? "" : "-rotate-90"
              }`}
            />
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 pb-5">
          <div className="relative ml-3">
            {/* 세로 연결선 */}
            <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-muted" />

            <div className="space-y-5">
              {TIMELINE_PHASES.map((phase, idx) => {
                const isCurrent = idx === currentPhaseIndex;
                const isPast = idx < currentPhaseIndex;
                const items = getCategoryProgress(
                  categories,
                  phase.categoryIds
                );
                const allDone =
                  items.length > 0 &&
                  items.every((it) => it.checked === it.total);

                return (
                  <div key={phase.label} className="relative pl-7">
                    {/* 타임라인 도트 */}
                    <div
                      className={`absolute left-0 top-0.5 size-4 rounded-full border-2 flex items-center justify-center ${
                        isCurrent
                          ? "border-primary bg-primary"
                          : allDone
                            ? "border-green-500 bg-green-500"
                            : isPast
                              ? "border-orange-400 bg-orange-400"
                              : "border-muted-foreground/30 bg-background"
                      }`}
                    >
                      {(allDone || isCurrent) && (
                        <div
                          className={`size-1.5 rounded-full ${
                            allDone
                              ? "bg-white"
                              : isCurrent
                                ? "bg-white animate-pulse"
                                : ""
                          }`}
                        />
                      )}
                    </div>

                    {/* 구간 라벨 */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-sm font-semibold ${
                          isCurrent ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {phase.label}
                      </span>
                      {isCurrent && (
                        <Badge className="text-[10px] px-1.5 py-0">
                          지금
                        </Badge>
                      )}
                      {allDone && (
                        <CheckCircle2 className="size-3.5 text-green-500" />
                      )}
                    </div>

                    {/* 카테고리별 진행률 */}
                    <div className="space-y-2">
                      {items.map((it) => {
                        const pct =
                          it.total === 0
                            ? 0
                            : Math.round((it.checked / it.total) * 100);
                        return (
                          <div key={it.title}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span
                                className={`text-xs ${
                                  isCurrent
                                    ? "font-medium text-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {it.emoji} {it.title}
                              </span>
                              <span className="text-[11px] text-muted-foreground tabular-nums">
                                {it.checked}/{it.total}
                              </span>
                            </div>
                            <Progress
                              value={pct}
                              className={
                                pct === 100
                                  ? "[&>div>div]:bg-green-500"
                                  : isCurrent
                                    ? "[&>div>div]:bg-primary"
                                    : ""
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
