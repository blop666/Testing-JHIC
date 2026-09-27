import { randomUUID } from "node:crypto";

export function auditAiAction(action: string, detail: Record<string, unknown>) {
  if (process.env.NODE_ENV === "test") return;
  const entry = {
    id: randomUUID(),
    at: new Date().toISOString(),
    action,
    ...detail,
  };
  console.log("[AI_AUDIT]", JSON.stringify(entry));
}
