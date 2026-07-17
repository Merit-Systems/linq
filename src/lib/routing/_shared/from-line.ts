import { ASSIGNED_FROM_LINE } from "./constants";

export { ASSIGNED_FROM_LINE };

/** Add assigned line to the Linq SDK payload — call only in handlers, never expose `from` to agents. */
export function injectFromLine<T extends Record<string, unknown>>(
  body: T,
): T & { from: string } {
  return { ...body, from: ASSIGNED_FROM_LINE };
}
