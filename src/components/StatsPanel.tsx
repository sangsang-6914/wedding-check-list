"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ChevronDown, Trophy, AlertCircle } from "lucide-react";
import { ChecklistCategory } from "@/lib/types";

interface StatsPanelProps {
  categories: ChecklistCategory[];
}

interface CategoryStat {
  id: string;
  emoji: string;
  title: string;
  total: number;
  checked: number;
  percent: number;
}

/** 카테고리별 완료 통계 대시보드 */
export function StatsPanel({ categories }: StatsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo<CategoryStat[]>(
    () =>
      categories.map((cat) => {
        const total = cat.items.length;
        const checked = cat.items.filter((i) => i.checked).length;
        return {
          id: cat.id,
          emoji: cat.emoji,
          title: cat.title,
          total,
          checked,
          percent: total === 0 ? 0 : Math.round((checked / total) * 100),
        };
      }),
    [categories]
  );

  const completedCategories = stats.filter((s) => s.percent === 100).length;
  const best = useMemo(
    () =>
      [...stats]
        .filter((s) => s.total > 0)
        .sort((a, b) => b.percent - a.percent)[0],
    [stats]
  );
  const worst = useMemo(
    () =>
      [...stats]
        .filter((s) => s.total > 0)
        .sort((a, b) => a.percent - b.percent)[0],
    [stats]
  );

  return (
    <Card>
      <CardHeader
        className="pb-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            카테고리별 진행 현황
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {completedCategories}/{stats.length} 완료
            </Badge>
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform ${
                expanded ? "" : "-rotate-90"
              }`}
            />
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {/* 카테고리별 바 차트 */}
          <div className="space-y-3">
            {stats.map((stat) => (
              <div key={stat.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {stat.emoji} {stat.title}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {stat.checked}/{stat.total} ({stat.percent}%)
                  </span>
                </div>
                <Progress
                  value={stat.percent}
                  className={
                    stat.percent === 100 ? "[&>div>div]:bg-green-500" : ""
                  }
                />
              </div>
            ))}
          </div>

          {/* 요약 */}
          {best && worst && (
            <div className="pt-3 border-t space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="size-4 text-amber-500 shrink-0" />
                <span className="text-muted-foreground">가장 잘 진행중:</span>
                <span className="font-medium">
                  {best.emoji} {best.title}
                </span>
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {best.percent}%
                </Badge>
              </div>
              {worst.id !== best.id && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="size-4 text-orange-500 shrink-0" />
                  <span className="text-muted-foreground">더 신경 쓸 곳:</span>
                  <span className="font-medium">
                    {worst.emoji} {worst.title}
                  </span>
                  <Badge variant="secondary" className="text-[10px] ml-auto">
                    {worst.percent}%
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
