export type SurveyStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export interface SurveyCounts {
  questions: number;
  responses: number;
}

export interface SurveyListItem {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: SurveyStatus;
  isAnonymous: boolean;
  allowMultipleResponses: boolean;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: SurveyCounts;
}

export interface SurveyDetail extends SurveyListItem {
  user: {
    id: string;
    name: string;
    email: string;
  };
  questions?: SurveyQuestion[];
}

export interface SurveyQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  position: number;
  minValue: number | null;
  maxValue: number | null;
  options: SurveyQuestionOption[];
}

export interface SurveyQuestionOption {
  id: string;
  optionText: string;
  position: number;
}

export type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "DROPDOWN"
  | "RATING"
  | "YES_NO"
  | "NUMBER"
  | "DATE";

export interface SurveyListResponse {
  surveys: SurveyListItem[];
}

export interface CreateSurveyPayload {
  title: string;
  description?: string;
  slug?: string;
  isAnonymous?: boolean;
  allowMultipleResponses?: boolean;
}

export interface UpdateSurveyPayload {
  title?: string;
  description?: string;
  slug?: string;
  status?: SurveyStatus;
  isAnonymous?: boolean;
  allowMultipleResponses?: boolean;
}
