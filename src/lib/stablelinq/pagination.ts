import { z } from "zod";

export const stablelinqPaginationLimitSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .optional()
  .default(20);

export const stablelinqPaginationCursorSchema = z.string().optional();

export interface StablelinqCursorPayload {
  createdAt: string;
  id: string;
}

export function encodeStablelinqCursor(payload: StablelinqCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeStablelinqCursor(
  cursor: string,
): StablelinqCursorPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as StablelinqCursorPayload;
    if (
      typeof parsed.createdAt !== "string" ||
      typeof parsed.id !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
