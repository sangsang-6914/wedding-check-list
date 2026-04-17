"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ProgressHeaderProps {
  checkedItems: number;
  totalItems: number;
  progress: number;
}

/** 전체 진행률을 보여주는 헤더 컴포넌트 */
export function ProgressHeader({
  checkedItems,
  totalItems,
  progress,
}: ProgressHeaderProps) {
  const getMessage = () => {
    if (progress === 0) return "웨딩 준비를 시작해볼까요? 💐";
    if (progress < 30) return "좋은 시작이에요! 천천히 해봐요 🌸";
    if (progress < 60) return "반 가까이 왔어요! 잘하고 있어요 💪";
    if (progress < 90) return "거의 다 됐어요! 조금만 더! 🎀";
    if (progress < 100) return "마무리 단계예요! 완벽해요 ✨";
    return "모든 준비가 완료되었어요! 축하해요 🎉";
  };

  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        💒 결혼 준비 체크리스트
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base">
        {getMessage()}
      </p>
      <div className="max-w-md mx-auto space-y-2">
        <div className="flex items-center justify-between text-sm">
          <Badge variant="secondary" className="font-medium">
            {checkedItems} / {totalItems} 완료
          </Badge>
          <span className="font-semibold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>
    </div>
  );
}
