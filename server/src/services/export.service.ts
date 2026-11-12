import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import type {
  QuestionTypeName,
  RawAnswer,
  ResultsSurvey,
} from "../services/response.service.js";
import {
  answerGroupValue,
  loadResponseRows,
  getOwnedSurveyForResults,
} from "../services/response.service.js";

/**
 * Spreadsheet formula-injection protection.
 * Values that could be interpreted as a formula by spreadsheet software
 * (leading `=`, `+`, `-`, `@`, tab or CR) are prefixed with a single quote
 * so they are treated as plain text.
 */
function neutralizeCsvValue(value: string): string {
  if (
    value.length === 0 ||
    /^[=+\-@\t\r]/.test(value)
  ) {
    return `'${value}`;
  }
  return value;
}

function escapeCell(value: string): string {
  const safe = neutralizeCsvValue(value);
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

interface QuestionHeader {
  questionId: string;
  questionText: string;
  position: number;
}

function buildHeaders(
  survey: ResultsSurvey,
  answersByQuestion: Map<string, RawAnswer[]>,
): QuestionHeader[] {
  const headers: QuestionHeader[] = [];
  const usedTexts = new Map<string, number>();

  for (const question of survey.questions) {
    let text = question.questionText;
    const occurrences = usedTexts.get(text) ?? 0;
    if (occurrences > 0) {
      text = `${question.questionText} [${question.id.slice(0, 8)}]`;
    }
    usedTexts.set(question.questionText, occurrences + 1);
    headers.push({ questionId: question.id, questionText: text, position: question.position });
  }

  for (const [questionId, answers] of answersByQuestion) {
    if (survey.questions.some((q) => q.id === questionId)) continue;
    const snapshot = answers.find((answer) => answer.questionTextSnapshot)?.questionTextSnapshot;
    let text = snapshot ?? "Deleted question";
    const occurrences = usedTexts.get(snapshot ?? "Deleted question") ?? 0;
    if (occurrences > 0) {
      text = `${text} [${questionId.slice(0, 8)}]`;
    }
    usedTexts.set(snapshot ?? "Deleted question", occurrences + 1);
    headers.push({
      questionId,
      questionText: text,
      position: answers.find((answer) => answer.questionPositionSnapshot != null)
        ? (answers.find((answer) => answer.questionPositionSnapshot != null)!
            .questionPositionSnapshot as number)
        : survey.questions.length + 1,
    });
  }

  headers.sort((a, b) => a.position - b.position);
  return headers;
}

function questionTypeFor(
  survey: ResultsSurvey,
  questionId: string,
): QuestionTypeName | null {
  const question = survey.questions.find((q) => q.id === questionId);
  return question ? question.questionType : null;
}

export async function generateSurveyCsv(
  surveyId: string,
  userId: string,
): Promise<{ filename: string; csv: string }> {
  const survey = await getOwnedSurveyForResults(surveyId, userId);
  const rows = await loadResponseRows(surveyId);

  const groupedByQuestion = new Map<string, RawAnswer[]>();
  for (const row of rows) {
    for (const answer of row.answers) {
      const key = answer.questionId ?? answer.questionTextSnapshot ?? answer.id;
      const existing = groupedByQuestion.get(key);
      if (existing) existing.push(answer);
      else groupedByQuestion.set(key, [answer]);
    }
  }

  if (!survey) {
    throw new AppError("Survey not found", 404);
  }

  const headers = buildHeaders(survey, groupedByQuestion);
  const fixedHeader = ["Response ID", "Submitted At", "Respondent Type"];
  const headerTexts = fixedHeader.concat(headers.map((header) => header.questionText));

  const lines = [headerTexts.join(",")];

  for (const row of rows) {
    const columns: string[] = [];
    columns.push(row.id);
    columns.push(row.createdAt.toISOString());
    columns.push(row.userId ? "Authenticated" : "Anonymous");

    const byQuestion = new Map<string, RawAnswer[]>();
    for (const answer of row.answers) {
      const key = answer.questionId ?? answer.questionTextSnapshot ?? answer.id;
      const existing = byQuestion.get(key);
      if (existing) existing.push(answer);
      else byQuestion.set(key, [answer]);
    }

    for (const header of headers) {
      const group = byQuestion.get(header.questionId);
      if (!group || group.length === 0) {
        columns.push("");
        continue;
      }
      const type = questionTypeFor(survey, header.questionId);
      if (type === "MULTIPLE_CHOICE") {
        const value = answerGroupValue(group, survey);
        columns.push(
          Array.isArray(value) ? value.join("; ") : String(value ?? ""),
        );
      } else {
        columns.push(String(answerGroupValue(group, survey) ?? ""));
      }
    }

    lines.push(columns.map((cell) => escapeCell(cell)).join(","));
  }

  const slug = survey.slug || "survey";
  return {
    filename: `survey-${slug}.csv`,
    csv: `\uFEFF${lines.join("\r\n")}`,
  };
}
