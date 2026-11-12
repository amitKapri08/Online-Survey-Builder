import {
  AlignLeft,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Hash,
  Star,
  ToggleLeft,
  Type,
} from "lucide-react";
import type { QuestionType } from "@/types/survey";

export const QUESTION_TYPE_OPTIONS: {
  value: QuestionType;
  label: string;
  icon: typeof Type;
  description: string;
}[] = [
  {
    value: "SHORT_TEXT",
    label: "Short text",
    icon: Type,
    description: "Single-line text response",
  },
  {
    value: "LONG_TEXT",
    label: "Long text",
    icon: AlignLeft,
    description: "Multi-line text response",
  },
  {
    value: "SINGLE_CHOICE",
    label: "Single choice",
    icon: CircleDot,
    description: "Select one option from a list",
  },
  {
    value: "MULTIPLE_CHOICE",
    label: "Multiple choice",
    icon: CheckSquare,
    description: "Select multiple options",
  },
  {
    value: "DROPDOWN",
    label: "Dropdown",
    icon: ChevronDown,
    description: "Choose from a dropdown menu",
  },
  {
    value: "RATING",
    label: "Rating",
    icon: Star,
    description: "Rate on a numeric scale",
  },
  {
    value: "YES_NO",
    label: "Yes / No",
    icon: ToggleLeft,
    description: "Binary yes or no choice",
  },
  {
    value: "NUMBER",
    label: "Number",
    icon: Hash,
    description: "Numeric input",
  },
  {
    value: "DATE",
    label: "Date",
    icon: Calendar,
    description: "Date picker",
  },
];

const CHOICE_TYPES: ReadonlyArray<string> = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "DROPDOWN",
];

export function isChoiceType(
  type: QuestionType | undefined,
): type is Extract<
  QuestionType,
  "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "DROPDOWN"
> {
  return typeof type === "string" && CHOICE_TYPES.includes(type);
}

export function isRangeType(
  type: QuestionType | undefined,
): type is Extract<QuestionType, "RATING" | "NUMBER"> {
  return type === "RATING" || type === "NUMBER";
}