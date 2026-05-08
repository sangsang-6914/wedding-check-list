"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Calendar, X, Pencil } from "lucide-react";
import { setWeddingDate } from "@/actions/wedding-date";

interface DdayCounterProps {
  initialDate: string | null;
  progress: number;
}

/** 남은 일수에 따른 응원 메시지 */
function getMessage(daysLeft: number, progress: number): string {
  if (daysLeft < 0) return "결혼식이 지났어요! 행복한 신혼생활 되세요 💕";
  if (daysLeft === 0) return "오늘이 결혼식이에요! 축하합니다 🎉";
  if (daysLeft <= 7)
    return `결혼식이 코앞이에요! ${progress < 80 ? "마지막 점검을!" : "준비 완벽해요!"} 💐`;
  if (daysLeft <= 30)
    return `한 달 이내! ${progress < 60 ? "마무리 점검할 시간이에요" : "잘 준비하고 있어요"} 🎀`;
  if (daysLeft <= 60) return "준비가 한창이네요! 화이팅 💪";
  if (daysLeft <= 100) return "아직 여유가 있어요! 차근차근 준비해봐요 🌸";
  return "넉넉한 시간이 있어요! 천천히 준비해봐요 ✨";
}

/** D-Day 배지 텍스트 */
function getDdayText(daysLeft: number): string {
  if (daysLeft < 0) return `D+${Math.abs(daysLeft)}`;
  if (daysLeft === 0) return "D-Day";
  return `D-${daysLeft}`;
}

/** 웨딩 D-Day 카운트다운 위젯 */
export function DdayCounter({ initialDate, progress }: DdayCounterProps) {
  const [weddingDate, setDate] = useState<string | null>(initialDate);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialDate ?? "");

  const daysLeft = useMemo(() => {
    if (!weddingDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = weddingDate.split("-").map(Number);
    const wedding = new Date(y, m - 1, d);
    return Math.ceil((wedding.getTime() - today.getTime()) / 86400000);
  }, [weddingDate]);

  const handleSave = useCallback(async () => {
    if (!inputValue) return;
    setDate(inputValue);
    setEditing(false);
    await setWeddingDate(inputValue);
  }, [inputValue]);

  const handleClear = useCallback(async () => {
    setDate(null);
    setInputValue("");
    setEditing(false);
    await setWeddingDate(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") setEditing(false);
    },
    [handleSave]
  );

  if (!weddingDate && !editing) {
    return (
      <Card className="border-dashed border-2 border-primary/30">
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <Heart className="size-8 text-primary/50" />
          <p className="text-sm text-muted-foreground">
            결혼식 날짜를 설정하고 D-Day를 확인해보세요
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="gap-1.5"
          >
            <Calendar className="size-4" />
            날짜 설정하기
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (editing) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-6">
          <Heart className="size-8 text-primary" />
          <p className="text-sm font-medium">결혼식 날짜를 선택해주세요</p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border-input bg-background text-foreground h-9 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <Button size="sm" onClick={handleSave} disabled={!inputValue}>
              저장
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
            >
              취소
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isDday = daysLeft === 0;

  return (
    <Card
      className={
        isDday
          ? "border-primary bg-primary/5"
          : isOverdue
            ? "border-muted"
            : "border-primary/40"
      }
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart
              className={`size-5 ${isDday ? "text-primary animate-pulse" : "text-primary"}`}
            />
            우리의 결혼식
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="size-7 p-0"
              onClick={() => {
                setInputValue(weddingDate ?? "");
                setEditing(true);
              }}
            >
              <Pencil className="size-3.5 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="size-7 p-0"
              onClick={handleClear}
            >
              <X className="size-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-center space-y-2 pb-5">
        <div className="flex items-center justify-center gap-3">
          <Badge
            variant={isDday ? "default" : isOverdue ? "secondary" : "outline"}
            className={`text-lg font-bold px-4 py-1 ${
              !isOverdue && !isDday ? "border-primary text-primary" : ""
            }`}
          >
            {getDdayText(daysLeft!)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {weddingDate?.replace(/-/g, ". ")}
        </p>
        <p className="text-sm text-muted-foreground">
          {getMessage(daysLeft!, progress)}
        </p>
      </CardContent>
    </Card>
  );
}
