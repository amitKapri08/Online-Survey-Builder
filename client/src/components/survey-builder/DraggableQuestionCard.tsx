import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { QuestionCard } from "@/components/question-builder/QuestionCard";
import type { SurveyQuestion } from "@/types/survey";
import type {
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from "@/types/survey";

interface DraggableQuestionCardProps {
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
  disabled?: boolean;
}

function DraggableQuestionCard(props: DraggableQuestionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.question.id, disabled: props.disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <QuestionCard
        {...props}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export { DraggableQuestionCard };