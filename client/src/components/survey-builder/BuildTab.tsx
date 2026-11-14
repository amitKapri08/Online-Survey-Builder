import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QUESTION_TYPE_OPTIONS } from "@/components/question-builder/questionTypes";
import { QuestionTypeSidebar } from "./QuestionTypeSidebar";
import { SurveyCanvas } from "./SurveyCanvas";
import {
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useReorderQuestions,
  useSetAllQuestionsRequired,
} from "@/hooks/useSurveyApi";
import { useBuilderSave } from "@/hooks/useBuilderSave";
import { getApiErrorMessage } from "@/lib/apiError";
import type { SurveyQuestion } from "@/types/survey";
import type { QuestionType } from "@/types/survey";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/types/survey";
import type { QuestionEditorInitialValues } from "@/components/question-builder/QuestionEditor";

const CREATING_KEY = "creating";
const TEMP_PREFIX = "temp-";

const isTempId = (id: string) => id.startsWith(TEMP_PREFIX);

function questionPayloadForClone(question: SurveyQuestion): CreateQuestionPayload {
  return {
    questionText: question.questionText,
    questionType: question.questionType,
    isRequired: question.isRequired,
    ...(question.minValue != null ? { minValue: question.minValue } : {}),
    ...(question.maxValue != null ? { maxValue: question.maxValue } : {}),
    ...(question.ratingLabels && question.ratingLabels.length > 0
      ? { ratingLabels: question.ratingLabels }
      : {}),
    options: question.options.map((option) => ({ optionText: option.optionText })),
  };
}

function defaultQuestionForType(type: QuestionType): CreateQuestionPayload {
  const base = { questionText: "Untitled question", questionType: type };
  switch (type) {
    case "SINGLE_CHOICE":
    case "MULTIPLE_CHOICE":
    case "DROPDOWN":
      return {
        ...base,
        options: [{ optionText: "Option 1" }, { optionText: "Option 2" }],
      };
    case "RATING":
      return { ...base, minValue: 1, maxValue: 5 };
    default:
      return base;
  }
}

function editingDefaultsFor(payload: CreateQuestionPayload): QuestionEditorInitialValues {
  return {
    questionText: payload.questionText,
    questionType: payload.questionType,
    isRequired: payload.isRequired ?? false,
    minValue: payload.minValue ?? null,
    maxValue: payload.maxValue ?? null,
    ratingLabels: payload.ratingLabels ?? [],
    options: (payload.options ?? []).map((option) => ({
      id: option.id,
      optionText: option.optionText,
    })),
  };
}

interface BuildTabProps {
  surveyId: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  isEditable: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

function BuildTab({
  surveyId,
  title,
  description,
  questions,
  isEditable,
  onTitleChange,
  onDescriptionChange,
}: BuildTabProps) {
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [draggedType, setDraggedType] = useState<QuestionType | null>(null);
  const [placeholders, setPlaceholders] = useState<
    Record<string, SurveyQuestion>
  >({});
  const [creatingInitialValues, setCreatingInitialValues] = useState<
    QuestionEditorInitialValues | null
  >(null);

  const createMutation = useCreateQuestion(surveyId);
  const updateMutation = useUpdateQuestion(surveyId);
  const deleteMutation = useDeleteQuestion(surveyId);
  const reorderMutation = useReorderQuestions(surveyId);
  const setAllRequiredMutation = useSetAllQuestionsRequired(surveyId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const questionsById = useMemo(() => {
    const map = new Map(questions.map((question) => [question.id, question]));
    for (const placeholder of Object.values(placeholders)) {
      map.set(placeholder.id, placeholder);
    }
    return map;
  }, [questions, placeholders]);

  const visibleQuestions = useMemo((): SurveyQuestion[] => {
    if (orderedIds.length > 0 && orderedIds.length === questions.length) {
      const resolved = orderedIds
        .map((id) => questionsById.get(id))
        .filter((question): question is SurveyQuestion => Boolean(question));
      if (resolved.length === orderedIds.length) {
        return resolved;
      }
    }
    return questions;
  }, [orderedIds, questions, questionsById]);

  const isCreating = editingId === CREATING_KEY;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const notifySaveStart = useBuilderSave().notifySaveStart;
  const notifySaveEnd = useBuilderSave().notifySaveEnd;

  const runWithSaveState = async <T,>(fn: () => Promise<T>): Promise<T> => {
    notifySaveStart();
    try {
      const result = await fn();
      notifySaveEnd(true);
      return result;
    } catch (error) {
      notifySaveEnd(false);
      throw error;
    }
  };

  const createFromType = (type: QuestionType) => {
    if (!isEditable || isPending || isCreating) return;
    setCreatingInitialValues(editingDefaultsFor(defaultQuestionForType(type)));
    setEditingId(CREATING_KEY);
  };

  const handleCreate = async (
    payload: CreateQuestionPayload | UpdateQuestionPayload,
  ) => {
    try {
      const created = await runWithSaveState(() =>
        createMutation.mutateAsync(payload as CreateQuestionPayload),
      );
      setOrderedIds((current) => [...current, created.id]);
      setEditingId(null);
      setCreatingInitialValues(null);
      toast.success("Question added");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to add question"));
    }
  };

  const handleCancelCreate = () => {
    setEditingId(null);
    setCreatingInitialValues(null);
  };

  const handleUpdate = async (
    questionId: string,
    payload: CreateQuestionPayload | UpdateQuestionPayload,
  ) => {
    try {
      await runWithSaveState(() =>
        updateMutation.mutateAsync({ questionId, payload }),
      );
      setEditingId(null);
      toast.success("Question saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save question"));
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      await runWithSaveState(() => deleteMutation.mutateAsync(questionId));
      setConfirmDeleteId(null);
      toast.success("Question deleted");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete question"));
    }
  };

  const handleQuickToggleRequired = async (
    questionId: string,
    isRequired: boolean,
  ) => {
    try {
      await runWithSaveState(() =>
        updateMutation.mutateAsync({
          questionId,
          payload: { isRequired },
        }),
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update question"));
    }
  };

  const handleSetAllRequired = async (isRequired: boolean) => {
    try {
      await runWithSaveState(() =>
        setAllRequiredMutation.mutateAsync(isRequired),
      );
      toast.success(
        isRequired
          ? "All questions are now required"
          : "All questions are now optional",
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update questions"));
    }
  };

  const handleDuplicate = async (questionId: string) => {
    const source = questionsById.get(questionId);
    if (!source || isTempId(questionId) || isPending) return;

    const placeholderId = `${TEMP_PREFIX}${crypto.randomUUID()}`;
    const placeholder: SurveyQuestion = {
      ...source,
      id: placeholderId,
      questionText: `${source.questionText} (copy)`,
    };

    setPlaceholders((current) => ({
      ...current,
      [placeholderId]: placeholder,
    }));
    setOrderedIds((current) => {
      const base =
        current.length === questions.length && current.length > 0
          ? current
          : questions.map((question) => question.id);
      const index = base.indexOf(questionId);
      const next = [...base];
      next.splice(index + 1, 0, placeholderId);
      return next;
    });

    try {
      const created = await runWithSaveState(() =>
        createMutation.mutateAsync(questionPayloadForClone(source)),
      );
      setOrderedIds((current) =>
        current.map((id) =>
          id === placeholderId ? created.id : id,
        ),
      );
      setPlaceholders((current) => {
        const next = { ...current };
        delete next[placeholderId];
        return next;
      });
      toast.success("Question duplicated");
    } catch (error) {
      setOrderedIds((current) =>
        current.filter((id) => id !== placeholderId),
      );
      setPlaceholders((current) => {
        const next = { ...current };
        delete next[placeholderId];
        return next;
      });
      toast.error(getApiErrorMessage(error, "Failed to duplicate question"));
    }
  };

  const performReorder = async (next: string[]) => {
    setOrderedIds(next);
    try {
      await runWithSaveState(() =>
        reorderMutation.mutateAsync(next.filter((id) => !isTempId(id))),
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to reorder questions"));
    }
  };

  const handleMove = (index: number, delta: number) => {
    if (isCreating) return;
    const current = visibleQuestions.map((question) => question.id);
    const target = index + delta;
    if (target < 0 || target >= current.length) return;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    void performReorder(next);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { questionType?: QuestionType };
    if (data?.questionType) {
      setDraggedType(data.questionType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = active.data.current as { questionType?: QuestionType };
    setDraggedType(null);

    if (activeData?.questionType) {
      if (over) {
        createFromType(activeData.questionType);
      }
      return;
    }

    if (!over) return;
    if (active.id === over.id) return;

    const current = visibleQuestions.map((question) => question.id);
    const oldIndex = current.indexOf(String(active.id));
    const newIndex = current.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(current, oldIndex, newIndex);
    void performReorder(next);
  };

  const deletingQuestion = confirmDeleteId
    ? visibleQuestions.find((question) => question.id === confirmDeleteId)
    : undefined;

  const draggedGroup = QUESTION_TYPE_OPTIONS.find(
    (option) => option.value === draggedType,
  );

  const requiredCount = visibleQuestions.filter(
    (question) => question.isRequired,
  ).length;
  const allRequired =
    visibleQuestions.length > 0 && requiredCount === visibleQuestions.length;
  const noneRequired = requiredCount === 0;
  const bulkRequiredPending = setAllRequiredMutation.isPending;

  return (
    <div className="lg:grid lg:grid-cols-[268px_1fr] lg:items-start lg:gap-8">
      <QuestionTypeSidebar
        onSelect={createFromType}
        isEditable={isEditable}
      />

      <div className="space-y-4">
        {isEditable && visibleQuestions.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card/60 px-3 py-2 shadow-2xs">
            <p className="text-xs font-medium text-muted-foreground">
              {allRequired
                ? "All questions are required"
                : noneRequired
                  ? "No questions are required"
                  : `${requiredCount} of ${visibleQuestions.length} required`}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleSetAllRequired(false)}
                disabled={
                  noneRequired || bulkRequiredPending || isPending || isCreating
                }
              >
                Clear all
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void handleSetAllRequired(true)}
                disabled={
                  allRequired || bulkRequiredPending || isPending || isCreating
                }
              >
                {bulkRequiredPending ? "Updating..." : "Mark all required"}
              </Button>
            </div>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SurveyCanvas
            title={title}
            description={description}
            questions={visibleQuestions}
            isEditable={isEditable}
            isPending={isPending}
            editingId={editingId}
            isCreating={isCreating}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
            onBeginCreate={() => {
              setCreatingInitialValues(null);
              setEditingId(CREATING_KEY);
            }}
            onStartEdit={(questionId) => {
              setCreatingInitialValues(null);
              setEditingId(questionId);
            }}
            onCancelEdit={handleCancelCreate}
            onSave={handleUpdate}
            onCreate={handleCreate}
            onDelete={setConfirmDeleteId}
            onDuplicate={handleDuplicate}
            onMoveUp={(index) => handleMove(index, -1)}
            onMoveDown={(index) => handleMove(index, 1)}
            onQuickToggleRequired={handleQuickToggleRequired}
            creatingInitialValues={creatingInitialValues}
          />

          <DragOverlay>
            {draggedGroup ? (
              <div className="flex cursor-grabbing items-center gap-3 rounded-lg border bg-background p-3 shadow-lg">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                  <draggedGroup.icon className="size-4" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {draggedGroup.label}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete question</DialogTitle>
            <DialogDescription>
              This will permanently remove the question and its options. This
              action cannot be undone.
              {deletingQuestion && (
                <>
                  {" "}
                  You are deleting{" "}
                  <span className="font-medium text-foreground">
                    &ldquo;{deletingQuestion.questionText}&rdquo;
                  </span>
                  .
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { BuildTab };