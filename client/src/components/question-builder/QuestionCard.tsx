import {
  ArrowDown,
  ArrowUp,
  Asterisk,
  Copy,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { QuestionEditor } from "./QuestionEditor";
import { QuestionPreview } from "@/components/survey-builder/QuestionPreview";
import { QUESTION_TYPE_OPTIONS } from "./questionTypes";
import type { SurveyQuestion } from "@/types/survey";
import type { QuestionType } from "@/types/survey";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/types/survey";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: SurveyQuestion;
  index: number;
  total: number;
  isEditing: boolean;
  isEditable: boolean;
  isPending: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (
    payload: CreateQuestionPayload | UpdateQuestionPayload,
  ) => void | Promise<void>;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onQuickToggleRequired?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
}

function typeLabel(type: QuestionType): string {
  return (
    QUESTION_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
  );
}

function QuestionCard({
  question,
  index,
  total,
  isEditing,
  isEditable,
  isPending,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onQuickToggleRequired,
  dragHandleProps,
  isDragging,
}: QuestionCardProps) {
  const formattedIndex = String(index + 1).padStart(2, "0");

  return (
    <Card
      className={cn(
        "relative rounded-xl border border-border/80 bg-card shadow-xs transition-all duration-200",
        "data-pending:opacity-60",
        isDragging && "z-20 opacity-90 shadow-xl ring-2 ring-brand-500",
        !isEditing && "hover:border-border hover:shadow-sm",
      )}
      data-pending={isPending || undefined}
    >
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 p-4 sm:p-5">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Drag Handle Grip */}
          {dragHandleProps && (
            <button
              type="button"
              {...dragHandleProps}
              className="mt-1 cursor-grab touch-none rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
              aria-label="Drag to reorder question"
            >
              <GripVertical className="size-4" />
            </button>
          )}

          {/* Number Pill Badge matching mockup */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white shadow-2xs">
            {formattedIndex}
          </div>

          {/* Title & Type Badge */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onStartEdit}
                disabled={!isEditable || isPending}
                className={cn(
                  "truncate text-left text-sm font-semibold text-foreground transition-colors",
                  isEditable && !isPending
                    ? "cursor-pointer hover:text-brand-600 dark:hover:text-brand-400"
                    : "cursor-default",
                )}
                title={isEditable ? "Click to edit question" : undefined}
              >
                {question.questionText}
              </button>

              {question.isRequired && (
                <span
                  className="inline-flex items-center rounded bg-rose-50 px-1.5 py-0.5 text-[11px] font-semibold text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                  title="Required question"
                >
                  Required
                </span>
              )}

              <Badge variant="outline" className="text-[11px] font-normal">
                {typeLabel(question.questionType)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        {!isEditing && !isDragging && isEditable && (
          <div className="flex items-center gap-1 shrink-0">
            {onQuickToggleRequired && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onQuickToggleRequired}
                className={cn(
                  "rounded-lg",
                  question.isRequired
                    ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-pressed={question.isRequired}
                title={question.isRequired ? "Required (click to make optional)" : "Optional (click to make required)"}
              >
                <Asterisk className="size-3.5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onMoveUp}
              disabled={index === 0}
              aria-label="Move question up"
              className="rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ArrowUp className="size-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onMoveDown}
              disabled={index === total - 1}
              aria-label="Move question down"
              className="rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <ArrowDown className="size-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onStartEdit}
              aria-label="Edit question"
              className="rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Pencil className="size-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onDuplicate}
              disabled={isPending}
              aria-label="Duplicate question"
              className="rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Copy className="size-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onDelete}
              aria-label="Delete question"
              className="rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 sm:pt-0">
        {isEditing ? (
          <QuestionEditor
            initialValues={{
              questionText: question.questionText,
              questionType: question.questionType,
              isRequired: question.isRequired,
              minValue: question.minValue,
              maxValue: question.maxValue,
              options: question.options.map((option) => ({
                id: option.id,
                optionText: option.optionText,
              })),
            }}
            isPending={isPending}
            onCancel={onCancelEdit}
            onSubmit={onSave}
          />
        ) : (
          <div className="ml-11 mt-1">
            <QuestionPreview question={question} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { QuestionCard };