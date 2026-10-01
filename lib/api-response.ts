export type ApiError = {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
};

export function apiSuccess<T>(data: T, init?: ResponseInit, meta?: Record<string, unknown>) {
  return Response.json({ success: true, data, ...(meta ? { meta } : {}) }, init);
}

export function apiError(error: ApiError, init?: ResponseInit) {
  return Response.json({ success: false, error }, init);
}

export function apiErrorMessage(error: { message?: string; details?: Array<{ field: string; message: string }> } | undefined, fallback: string) {
  if (!error) return fallback;
  const detail = (error.details ?? [])
    .map((item) => `${item.field}: ${item.message}`)
    .join(" · ");
  return detail ? `${error.message ?? "Data tidak valid."} (${detail})` : (error.message ?? fallback);
}
