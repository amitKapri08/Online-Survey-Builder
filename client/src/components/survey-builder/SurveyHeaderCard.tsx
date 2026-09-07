import { useState } from "react";
import { Pencil } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SurveyHeaderCardProps {
  title: string;
  description: string;
  isEditable: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

function InlineText({
  value,
  isEditable,
  onChange,
  placeholder,
  className,
  fieldName,
}: {
  value: string;
  isEditable: boolean;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
  fieldName: string;
}) {
  const [draft, setDraft] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  const handleStart = () => {
    if (!isEditable) return;
    setDraft(value);
    setIsEditing(true);
  };

  const handleFinish = () => {
    setIsEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    } else {
      setDraft(value);
    }
  };

  const handleDraftChange = (next: string) => {
    setDraft(next);
    onChange(next);
  };

  return (
    <div className="group relative">
      {isEditing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          onBlur={handleFinish}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && fieldName === "title") {
              e.preventDefault();
              handleFinish();
            }
            if (e.key === "Escape") {
              setDraft(value);
              setIsEditing(false);
            }
          }}
          rows={fieldName === "title" ? 1 : 3}
          className={cn(
            className,
            "w-full resize-none border-b border-foreground bg-transparent outline-none",
          )}
          aria-label={placeholder}
        />
      ) : (
        <button
          type="button"
          onClick={handleStart}
          disabled={!isEditable}
          className={cn(
            className,
            "block w-full cursor-pointer rounded px-1 text-left transition-colors hover:bg-muted",
            !isEditable && "cursor-text",
          )}
        >
          {value ? (
            value
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {isEditable && (
            <Pencil className="ml-1 inline size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      )}
    </div>
  );
}

function SurveyHeaderCard({
  title,
  description,
  isEditable,
  onTitleChange,
  onDescriptionChange,
}: SurveyHeaderCardProps) {
  return (
    <Card className="border-t-4 border-t-foreground">
      <CardContent className="space-y-2 pt-6">
        <InlineText
          value={title}
          isEditable={isEditable}
          onChange={onTitleChange}
          fieldName="title"
          placeholder="Survey title"
          className="text-xl font-bold text-foreground sm:text-2xl"
        />
        <InlineText
          value={description}
          isEditable={isEditable}
          onChange={onDescriptionChange}
          fieldName="description"
          placeholder="Survey description (optional)"
          className="text-sm text-muted-foreground"
        />
      </CardContent>
    </Card>
  );
}

export { SurveyHeaderCard };