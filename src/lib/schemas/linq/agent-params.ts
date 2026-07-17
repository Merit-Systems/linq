import { z } from "zod";

/** Agent-facing request schemas omit server-owned fields (e.g. `from`). */
export function agentParamsWithoutFrom<T extends z.ZodObject<z.ZodRawShape>>(
  schema: T,
) {
  return schema.omit({ from: true });
}
