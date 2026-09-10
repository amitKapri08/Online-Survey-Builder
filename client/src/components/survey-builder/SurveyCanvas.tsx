import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { GripVertical, Pencil, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { QuestionEditor } from "@/components/question-builder/QuestionEditor";
import { DraggableQuestionCard } from "./DraggableQuestionCard";
import { SurveyHeaderCard } from "./SurveyHeaderCard";
import { cn } from "@/lib/utils";
import type { QuestionEditorInitialValues } from "@/components/question-builder/QuestionEditor";
import type { SurveyQuestion } from "@/types/survey";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/types/survey";

export const SURVEY_CANVAS_DROP_ID = "survey-canvas";

interface SurveyCanvasProps {
  title: string;
  description: string;
  questions: SurveyQuestion[];
  isEditable: boolean;
  isPending: boolean;
  editingId: string | null;
  isCreating: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onBeginCreate: () => void;
  onStartEdit: (questionId: string) => void;
  onCancelEdit: () => void;
  onSave: (questionId: string, payload: UpdateQuestionPayload) => void;
  onCreate: (payload: CreateQuestionPayload | UpdateQuestionPayload) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (questionId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onQuickToggleRequired?: (questionId: string, isRequired: boolean) => void;
  creatingInitialValues?: QuestionEditorInitialValues | null;
}

function SurveyCanvas({
  title,
  description,
  questions,
  isEditable,
  isPending,
  editingId,
  isCreating,
  onTitleChange,
  onDescriptionChange,
  onBeginCreate,
  onStartEdit,
  onCancelEdit,
  onSave,
  onCreate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onQuickToggleRequired,
  creatingInitialValues,
}: SurveyCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: SURVEY_CANVAS_DROP_ID,
    disabled: !isEditable,
  });
  const questionIds = questions.map((question) => question.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[70vh] space-y-4 rounded-2xl transition-all duration-200",
        isOver && "ring-2 ring-brand-500/80 bg-brand-500/[0.02]",
      )}
    >
      <SurveyHeaderCard
        title={title}
        description={description}
        isEditable={isEditable}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
      />

      {questions.length === 0 ? (
        <EmptyState
          icon={Pencil}
          title="No questions yet"
          description="Choose a question type from the sidebar on the left, or click Add question below to get started."
          action={
            isEditable
              ? { label: "Add your first question", onClick: onBeginCreate }
              : undefined
          }
        />
      ) : (
        <SortableContext
          items={questionIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {questions.map((question, index) => (
              <DraggableQuestionCard
                key={question.id}
                question={question}
                index={index}
                total={questions.length}
                isEditing={editingId === question.id}
                isEditable={isEditable}
                isPending={isPending}
                onStartEdit={() => onStartEdit(question.id)}
                onCancelEdit={onCancelEdit}
                onSave={(payload) => onSave(question.id, payload)}
                onDelete={() => onDelete(question.id)}
                onDuplicate={() => onDuplicate(question.id)}
                onMoveUp={() => onMoveUp(index)}
                onMoveDown={() => onMoveDown(index)}
                onQuickToggleRequired={
                  onQuickToggleRequired
                    ? () =>
                        onQuickToggleRequired(question.id, !question.isRequired)
                    : undefined
                }
                disabled={!isEditable}
              />
            ))}
          </div>
        </SortableContext>
      )}

      {isCreating && (
        <Card
          className="rounded-xl border border-border/80 bg-card shadow-xs data-pending:opacity-60"
          data-pending={isPending || undefined}
        >
          <CardHeader className="flex-row items-center gap-3 p-4 pb-0 sm:p-5 sm:pb-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white shadow-2xs">
              {String(questions.length + 1).padStart(2, "0")}
            </div>
            <span className="text-sm font-semibold text-foreground">
              New Question
            </span>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-3 sm:pt-3">
            <QuestionEditor
              isCreating
              isPending={isPending}
              initialValues={creatingInitialValues ?? undefined}
              onCancel={onCancelEdit}
              onSubmit={onCreate}
            />
          </CardContent>
        </Card>
      )}

      {isEditable && !isCreating && (
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={onBeginCreate}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/80 bg-background/50 py-3.5 text-sm font-semibold text-muted-foreground shadow-2xs transition-all duration-150 hover:border-brand-500/50 hover:bg-muted/40 hover:text-foreground"
          >
            <Plus className="size-4 text-brand-600 dark:text-brand-400" />
            <span>Add Question</span>
          </button>
          {questions.length > 0 && (
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <GripVertical className="size-3.5" />
              Drag questions to reorder, or drop a type from the palette
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export { SurveyCanvas };