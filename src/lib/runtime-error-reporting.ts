export function reportRuntimeError(
  error: unknown,
  context: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  const message =
    error instanceof Response
      ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  const payload = {
    message,
    stack: error instanceof Error ? error.stack : undefined,
    route: window.location.pathname,
    ...context,
  };

  console.error("[Rezyn runtime error]", payload);
}
