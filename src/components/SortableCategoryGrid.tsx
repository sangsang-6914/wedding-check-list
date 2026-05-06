"use client";

import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChecklistCategory } from "@/lib/types";
import { CategoryCard } from "./CategoryCard";
import { GripVertical } from "lucide-react";

interface SortableCategoryGridProps {
  categories: ChecklistCategory[];
  collapsedCategories: Set<string>;
  onToggle: (categoryId: string, itemId: string) => void;
  onDueDateChange: (
    categoryId: string,
    itemId: string,
    value: string | null
  ) => void;
  onMemoChange: (categoryId: string, itemId: string, value: string) => void;
  onMemoBlur: (categoryId: string, itemId: string, value: string) => void;
  onAddItem: (categoryId: string, label: string) => Promise<void>;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onReorder: (newOrder: string[]) => void;
  onToggleCollapse: (categoryId: string) => void;
}

/** 정렬 가능한 카테고리 카드 래퍼 */
function SortableCard({
  category,
  collapsed,
  onToggle,
  onDueDateChange,
  onMemoChange,
  onMemoBlur,
  onAddItem,
  onDeleteItem,
  onToggleCollapse,
}: Omit<SortableCategoryGridProps, "categories" | "onReorder" | "collapsedCategories"> & {
  category: ChecklistCategory;
  collapsed: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CategoryCard
        category={category}
        collapsed={collapsed}
        onToggle={onToggle}
        onDueDateChange={onDueDateChange}
        onMemoChange={onMemoChange}
        onMemoBlur={onMemoBlur}
        onAddItem={onAddItem}
        onDeleteItem={onDeleteItem}
        onToggleCollapse={onToggleCollapse}
        dragHandle={
          <button
            type="button"
            className="touch-none cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
            aria-label="드래그하여 순서 변경"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        }
      />
    </div>
  );
}

/** DnD 컨텍스트를 포함하는 카테고리 그리드 */
export function SortableCategoryGrid({
  categories,
  collapsedCategories,
  onToggle,
  onDueDateChange,
  onMemoChange,
  onMemoBlur,
  onAddItem,
  onDeleteItem,
  onReorder,
  onToggleCollapse,
}: SortableCategoryGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const ids = categories.map((c) => c.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return;

      onReorder(arrayMove(ids, oldIndex, newIndex));
    },
    [categories, onReorder]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={categories.map((c) => c.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <SortableCard
              key={category.id}
              category={category}
              collapsed={collapsedCategories.has(category.id)}
              onToggle={onToggle}
              onDueDateChange={onDueDateChange}
              onMemoChange={onMemoChange}
              onMemoBlur={onMemoBlur}
              onAddItem={onAddItem}
              onDeleteItem={onDeleteItem}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
