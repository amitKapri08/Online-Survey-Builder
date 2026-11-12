export type NumberValidationErrorCode =
  | "INVALID_NUMBER"
  | "NOT_AN_INTEGER"
  | "LESS_THAN_MIN"
  | "GREATER_THAN_MAX";

export function validateNumberAnswer(
  value: unknown,
  minValue?: number | null,
  maxValue?: number | null,
): { valid: true } | { valid: false; code: NumberValidationErrorCode } {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return { valid: false, code: "INVALID_NUMBER" };
  }
  if (!Number.isInteger(value)) {
    return { valid: false, code: "NOT_AN_INTEGER" };
  }
  if (minValue != null && value < minValue) {
    return { valid: false, code: "LESS_THAN_MIN" };
  }
  if (maxValue != null && value > maxValue) {
    return { valid: false, code: "GREATER_THAN_MAX" };
  }
  return { valid: true };
}

export function isValidNumberAnswer(
  value: unknown,
  minValue?: number | null,
  maxValue?: number | null,
): boolean {
  return validateNumberAnswer(value, minValue, maxValue).valid;
}
