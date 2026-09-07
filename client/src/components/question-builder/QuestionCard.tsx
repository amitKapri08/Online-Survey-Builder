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
  return (
    <Card
      className={cn(
        "data-pending:opacity-60",
        isDragging && "relative z-10 opacity-70 shadow-lg ring-2 ring-foreground",
      )}
      data-pending={isPending || undefined}
    >
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex items-start gap-3">
          {dragHandleProps && (
            <button
              type="button"
              {...dragHandleProps}
              className="mt-0.5 cursor-grab touch-none rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-pressed:cursor-grabbing"
              aria-label="Drag to reorder question"
            >
              <GripVertical className="size-4" />
            </button>
          )}
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {index + 1}
          </span>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onStartEdit}
                disabled={!isEditable || isPending}
                className={cn(
                  "max-w-full truncate text-left text-sm font-medium text-foreground",
                  isEditable && !isPending
                    ? "cursor-pointer rounded px-0.5 hover:bg-muted hover:underline"
                    : "cursor-default",
                )}
                title={isEditable ? "Click to edit question" : undefined}
              >
                {question.questionText}
              </button>
              {question.isRequired && (
                <span
                  className="text-sm text-destructive"
                  aria-label="Required question"
                >
                  *
                </span>
              )}
              <Badge variant="outline">{typeLabel(question.questionType)}</Badge>
            </div>
          </div>
        </div>
        {!isEditing && !isDragging && isEditable && (
          <div className="flex items-center gap-1">
            {onQuickToggleRequired && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onQuickToggleRequired}
                className={cn(
                  question.isRequired
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
                aria-pressed={question.isRequired}
                aria-label={
                  question.isRequired
                    ? "Question is required — click to make optional"
                    : "Question is optional — click to make required"
                }
                title={question.isRequired ? "Required" : "Optional"}
              >
                <Asterisk />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onMoveUp}
              disabled={index === 0}
              aria-label="Move question up"
            >
              <ArrowUp />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onMoveDown}
              disabled={index === total - 1}
              aria-label="Move question down"
            >
              <ArrowDown />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onStartEdit}
              aria-label="Edit question"
            >
              <Pencil />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onDuplicate}
              disabled={isPending}
              aria-label="Duplicate question"
            >
              <Copy />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onDelete}
              aria-label="Delete question"
            >
              <Trash2 />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
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
          <div className="ml-9 mt-2">
            <QuestionPreview question={question} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { QuestionCard };