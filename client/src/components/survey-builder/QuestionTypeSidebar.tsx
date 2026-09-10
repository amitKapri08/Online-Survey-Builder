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
        "group relative flex w-full items-center gap-3 rounded-xl border border-border/70 bg-card p-2.5 text-left shadow-2xs transition-all duration-150",
        isEditable
          ? "cursor-grab active:cursor-grabbing hover:border-brand-500/40 hover:bg-muted/40 hover:shadow-xs"
          : "cursor-not-allowed opacity-50",
        isDragging && "opacity-30 ring-2 ring-brand-500",
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand-500/10 group-hover:text-brand-600 dark:group-hover:text-brand-400">
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold text-foreground">
          {type.label}
        </span>
        <span className="block truncate text-[11px] text-muted-foreground">
          {type.description}
        </span>
      </span>

      <span className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        <Plus className="size-3.5" />
      </span>
    </button>
  );
}

function QuestionTypeSidebar({ onSelect, isEditable }: QuestionTypeSidebarProps) {
  return (
    <aside className="lg:sticky lg:top-[73px]">
      <div className="space-y-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Question Palette
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Click to insert or drag onto the canvas.
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