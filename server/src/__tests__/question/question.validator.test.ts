import { describe, expect, it } from "vitest";
import {
  createQuestionSchema,
  updateQuestionSchema,
  batchCreateQuestionsSchema,
  reorderQuestionsSchema,
  createOptionSchema,
  updateOptionSchema,
  QUESTION_TYPES,
} from "../../validators/question.validator.js";

describe("createQuestionSchema", () => {
  it("parses a valid SHORT_TEXT question", () => {
    const result = createQuestionSchema.parse({
      questionText: "What is your name?",
      questionType: "SHORT_TEXT",
    });
    expect(result.questionText).toBe("What is your name?");
    expect(result.questionType).toBe("SHORT_TEXT");
    expect(result.isRequired).toBeUndefined();
  });

  it("parses a valid RATING question with minValue and maxValue", () => {
    const result = createQuestionSchema.parse({
      questionText: "Rate this product",
      questionType: "RATING",
      minValue: 1,
      maxValue: 5,
    });
    expect(result.minValue).toBe(1);
    expect(result.maxValue).toBe(5);
  });

  it("parses a valid SINGLE_CHOICE question with options", () => {
    const result = createQuestionSchema.parse({
      questionText: "Pick one",
      questionType: "SINGLE_CHOICE",
      options: [
        { optionText: "Option A" },
        { optionText: "Option B" },
      ],
    });
    expect(result.options).toHaveLength(2);
  });

  it("parses a valid MULTIPLE_CHOICE question with options", () => {
    const result = createQuestionSchema.parse({
      questionText: "Pick multiple",
      questionType: "MULTIPLE_CHOICE",
      options: [
        { optionText: "A" },
        { optionText: "B" },
        { optionText: "C" },
      ],
    });
    expect(result.options).toHaveLength(3);
  });

  it("parses a valid DROPDOWN question with options", () => {
    const result = createQuestionSchema.parse({
      questionText: "Select one",
      questionType: "DROPDOWN",
      options: [
        { optionText: "Opt 1" },
        { optionText: "Opt 2" },
      ],
    });
    expect(result.options).toHaveLength(2);
  });

  it("parses a valid NUMBER question", () => {
    const result = createQuestionSchema.parse({
      questionText: "How old are you?",
      questionType: "NUMBER",
      minValue: 0,
      maxValue: 150,
    });
    expect(result.minValue).toBe(0);
    expect(result.maxValue).toBe(150);
  });

  it("parses a valid YES_NO question", () => {
    const result = createQuestionSchema.parse({
      questionText: "Do you agree?",
      questionType: "YES_NO",
    });
    expect(result.questionType).toBe("YES_NO");
  });

  it("parses a valid DATE question", () => {
    const result = createQuestionSchema.parse({
      questionText: "When is your birthday?",
      questionType: "DATE",
    });
    expect(result.questionType).toBe("DATE");
  });

  it("parses a valid LONG_TEXT question", () => {
    const result = createQuestionSchema.parse({
      questionText: "Describe your experience",
      questionType: "LONG_TEXT",
      isRequired: true,
    });
    expect(result.isRequired).toBe(true);
  });

  it("rejects empty questionText", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "",
        questionType: "SHORT_TEXT",
      }),
    ).toThrow();
  });

  it("rejects questionText over 1000 characters", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "X".repeat(1001),
        questionType: "SHORT_TEXT",
      }),
    ).toThrow();
  });

  it("rejects invalid questionType", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "Question",
        questionType: "INVALID",
      }),
    ).toThrow();
  });

  it("rejects RATING without minValue", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "Rate",
        questionType: "RATING",
        maxValue: 5,
      }),
    ).toThrow();
  });

  it("rejects RATING without maxValue", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "Rate",
        questionType: "RATING",
        minValue: 1,
      }),
    ).toThrow();
  });

  it("rejects RATING when maxValue <= minValue", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "Rate",
        questionType: "RATING",
        minValue: 5,
        maxValue: 5,
      }),
    ).toThrow();
  });

  it("rejects SINGLE_CHOICE with fewer than 2 options", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "Pick",
        questionType: "SINGLE_CHOICE",
        options: [{ optionText: "Only one" }],
      }),
    ).toThrow();
  });

  it("rejects MULTIPLE_CHOICE with no options", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "Pick",
        questionType: "MULTIPLE_CHOICE",
      }),
    ).toThrow();
  });

  it("rejects SINGLE_CHOICE with minValue", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "Pick",
        questionType: "SINGLE_CHOICE",
        minValue: 1,
        options: [
          { optionText: "A" },
          { optionText: "B" },
        ],
      }),
    ).toThrow();
  });

  it("rejects SHORT_TEXT with options", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "Name",
        questionType: "SHORT_TEXT",
        options: [{ optionText: "A" }],
      }),
    ).toThrow();
  });

  it("rejects SHORT_TEXT with minValue", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "Name",
        questionType: "SHORT_TEXT",
        minValue: 1,
      }),
    ).toThrow();
  });

  it("rejects option with empty text", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "Pick",
        questionType: "SINGLE_CHOICE",
        options: [
          { optionText: "" },
          { optionText: "B" },
        ],
      }),
    ).toThrow();
  });

  it("rejects option text over 500 characters", () => {
    expect(() =>
      createQuestionSchema.parse({
        questionText: "Pick",
        questionType: "SINGLE_CHOICE",
        options: [
          { optionText: "X".repeat(501) },
          { optionText: "B" },
        ],
      }),
    ).toThrow();
  });

  it("accepts all valid question types", () => {
    for (const type of QUESTION_TYPES) {
      const input: any = {
        questionText: "Q",
        questionType: type,
      };
      if (type === "RATING") {
        input.minValue = 1;
        input.maxValue = 5;
      }
      if (["SINGLE_CHOICE", "MULTIPLE_CHOICE", "DROPDOWN"].includes(type)) {
        input.options = [
          { optionText: "A" },
          { optionText: "B" },
        ];
      }
      expect(() => createQuestionSchema.parse(input)).not.toThrow();
    }
  });
});

describe("updateQuestionSchema", () => {
  it("parses valid partial update", () => {
    const result = updateQuestionSchema.parse({
      questionText: "Updated question",
    });
    expect(result.questionText).toBe("Updated question");
  });

  it("rejects empty object", () => {
    expect(() => updateQuestionSchema.parse({})).toThrow();
  });

  it("allows setting minValue and maxValue to null", () => {
    const result = updateQuestionSchema.parse({
      minValue: null,
      maxValue: null,
    });
    expect(result.minValue).toBeNull();
    expect(result.maxValue).toBeNull();
  });
});

describe("batchCreateQuestionsSchema", () => {
  it("parses valid batch of questions", () => {
    const result = batchCreateQuestionsSchema.parse({
      questions: [
        { questionText: "Q1", questionType: "SHORT_TEXT" },
        { questionText: "Q2", questionType: "YES_NO" },
      ],
    });
    expect(result.questions).toHaveLength(2);
  });

  it("rejects empty questions array", () => {
    expect(() => batchCreateQuestionsSchema.parse({ questions: [] })).toThrow();
  });

  it("rejects more than 100 questions", () => {
    const questions = Array.from({ length: 101 }, (_, i) => ({
      questionText: `Q${i}`,
      questionType: "SHORT_TEXT" as const,
    }));
    expect(() => batchCreateQuestionsSchema.parse({ questions })).toThrow();
  });
});

describe("reorderQuestionsSchema", () => {
  it("parses valid reorder input", () => {
    const result = reorderQuestionsSchema.parse({
      questionIds: [
        "550e8400-e29b-41d4-a716-446655440000",
        "550e8400-e29b-41d4-a716-446655440001",
      ],
    });
    expect(result.questionIds).toHaveLength(2);
  });

  it("rejects fewer than 2 IDs", () => {
    expect(() =>
      reorderQuestionsSchema.parse({
        questionIds: ["550e8400-e29b-41d4-a716-446655440000"],
      }),
    ).toThrow();
  });

  it("rejects non-UUID strings", () => {
    expect(() =>
      reorderQuestionsSchema.parse({
        questionIds: ["not-a-uuid", "also-not-a-uuid"],
      }),
    ).toThrow();
  });
});

describe("createOptionSchema", () => {
  it("parses valid option", () => {
    const result = createOptionSchema.parse({ optionText: "Option A" });
    expect(result.optionText).toBe("Option A");
  });

  it("parses option with position", () => {
    const result = createOptionSchema.parse({
      optionText: "Option A",
      position: 3,
    });
    expect(result.position).toBe(3);
  });

  it("rejects empty optionText", () => {
    expect(() => createOptionSchema.parse({ optionText: "" })).toThrow();
  });

  it("rejects optionText over 500 characters", () => {
    expect(() =>
      createOptionSchema.parse({ optionText: "X".repeat(501) }),
    ).toThrow();
  });
});

describe("updateOptionSchema", () => {
  it("parses valid partial update", () => {
    const result = updateOptionSchema.parse({ optionText: "Updated" });
    expect(result.optionText).toBe("Updated");
  });

  it("rejects empty object", () => {
    expect(() => updateOptionSchema.parse({})).toThrow();
  });
});
