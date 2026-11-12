import { randomBytes, timingSafeEqual } from "node:crypto";

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

  const a = Buffer.from(headerToken);
  const b = Buffer.from(cookieToken);

  return a.length === b.length && timingSafeEqual(a, b);
};
