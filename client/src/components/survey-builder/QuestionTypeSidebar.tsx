import { useDraggable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { QUESTION_TYPE_OPTIONS } from "@/components/question-builder/questionTypes";
import type { QuestionType } from "@/types/survey";
import { cn } from "@/lib/utils";

export const QUESTION_TYPE_DRAG_PREFIX = "question-type:";

interface QuestionTypeSidebarProps {
  onSelect: (type: QuestionType) => void;
  isEditable: boolean;
}

function TypeItem({
  type,
  onSelect,
  isEditable,
}: {
  type: (typeof QUESTION_TYPE_OPTIONS)[number];
  onSelect: (type: QuestionType) => void;
  isEditable: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${QUESTION_TYPE_DRAG_PREFIX}${type.value}`,
    data: { questionType: type.value },
    disabled: !isEditable,
  });
  const Icon = type.icon;

  return (
    <button
      ref={setNodeRef}
      type="button"
      disabled={!isEditable}
      onClick={() => isEditable && onSelect(type.value)}
      {...attributes}
      {...listeners}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        isEditable
          ? "hover:border-foreground/40 hover:bg-muted"
          : "cursor-not-allowed opacity-50",
        isDragging && "opacity-30",
      )}
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            {type.label}
          </span>
          <Plus className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {type.description}
        </span>
      </span>
    </button>
  );
}

function QuestionTypeSidebar({ onSelect, isEditable }: QuestionTypeSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-[73px]">
      <div className="space-y-2">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Question types
          </h2>
          <p className="text-xs text-muted-foreground">
            Click a type to add it, or drag it onto the canvas.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {QUESTION_TYPE_OPTIONS.map((type) => (
            <TypeItem
              key={type.value}
              type={type}
              onSelect={onSelect}
              isEditable={isEditable}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

export { QuestionTypeSidebar };