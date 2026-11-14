import { ROUTES } from "@/lib/routes";

interface RedirectState {
  from?: { pathname?: string } | string;
}

/**
 * Resolve the post-authentication destination from router location state.
 * Falls back to the dashboard when no return path was provided.
 */
export function getPostAuthRedirect(state: unknown): string {
  const from = (state as RedirectState | null | undefined)?.from;

  if (typeof from === "string" && from.startsWith("/")) {
    return from;
  }

  if (
    from &&
    typeof from === "object" &&
    typeof from.pathname === "string" &&
    from.pathname.startsWith("/")
  ) {
    return from.pathname;
  }

  return ROUTES.DASHBOARD;
}
