"use client";

import { ChecklistCategory } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface CategoryCardProps {
  category: ChecklistCategory;
  onToggle: (categoryId: string, itemId: string) => void;
}

/** 카테고리별 체크리스트 카드 컴포넌트 */
export function CategoryCard({ category, onToggle }: CategoryCardProps) {
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <span className="text-xl">{category.emoji}</span>
            {category.title}
          </CardTitle>
          <Badge
            variant={allDone ? "default" : "outline"}
            className="text-xs"
          >
            {checked}/{total}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {category.items.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <Checkbox
              checked={item.checked}
              onCheckedChange={() => onToggle(category.id, item.id)}
            />
            <span
              className={`text-sm transition-all duration-200 ${
                item.checked
                  ? "line-through text-muted-foreground"
                  : "group-hover:text-primary"
              }`}
            >
              {item.label}
            </span>
          </label>
        ))}
      </CardContent>
    </Card>
  );
}
