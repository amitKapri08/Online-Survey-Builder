let csrfToken: string | null = null;

export function setStoredCsrfToken(token: string | null): void {
  csrfToken = token;
}

export function getStoredCsrfToken(): string | null {
  return csrfToken;
}
