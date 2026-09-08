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

export interface PublicSurvey {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: SurveyStatus;
  isAnonymous: boolean;
  allowMultipleResponses: boolean;
  questions: SurveyQuestion[];
}

export type SurveyAnswerValue = string | number | string[];

export interface SurveyAnswerInput {
  questionId: string;
  value: SurveyAnswerValue;
}

export interface SubmitResponsePayload {
  answers: SurveyAnswerInput[];
  submitAnonymously?: boolean;
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
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export interface QuestionOptionInput {
  id?: string;
  optionText: string;
  position?: number;
}

export interface CreateQuestionPayload {
  questionText: string;
  questionType: QuestionType;
  isRequired?: boolean;
  minValue?: number;
  maxValue?: number;
  options?: QuestionOptionInput[];
}

export interface UpdateQuestionPayload {
  questionText?: string;
  questionType?: QuestionType;
  isRequired?: boolean;
  minValue?: number | null;
  maxValue?: number | null;
  options?: QuestionOptionInput[];
}

export interface CreateOptionPayload {
  optionText: string;
  position?: number;
}

export interface UpdateOptionPayload {
  optionText?: string;
  position?: number;
}

export type RespondentType = "authenticated" | "anonymous";

export interface SurveyResponseAnswer {
  questionId: string | null;
  questionText: string;
  questionType: QuestionType | null;
  value: string | number | string[] | null;
}

export interface SurveyResponse {
  responseId: string;
  submittedAt: string;
  respondentType: RespondentType;
  answers: SurveyResponseAnswer[];
}

export interface ResponsesPage {
  responses: SurveyResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type QuestionAnalytics =
  | {
      type: "CHOICE";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      options: Array<{ optionId: string; optionText: string; count: number }>;
    }
  | {
      type: "YES_NO";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      yes: number;
      no: number;
    }
  | {
      type: "RATING";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      min: number;
      max: number;
      average: number;
      distribution: Array<{ value: number; count: number }>;
    }
  | {
      type: "NUMBER";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      min: number;
      max: number;
      average: number;
    }
  | {
      type: "TEXT";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      samples: Array<{ responseId: string; text: string; submittedAt: string }>;
    }
  | {
      type: "DATE";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      earliest: string | null;
      latest: string | null;
    };
