import { randomBytes } from "node:crypto";

export const generateCsrfToken = (): string => {
  return randomBytes(32).toString("hex");
};

export const verifyCsrfToken = (
  headerToken: string | undefined,
  cookieToken: string | undefined,
): boolean => {
  if (
    typeof headerToken !== "string" ||
    typeof cookieToken !== "string" ||
    headerToken.length === 0 ||
    cookieToken.length === 0
  ) {
    return false;
  }

  return headerToken === cookieToken;
};