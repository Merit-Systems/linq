import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const messageUpdateParamsSchema = z
  .object({
    text: z.string(),
    part_index: z.number().int().nonnegative().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.MessageUpdateParams>;

export type MessageUpdateParams = z.infer<typeof messageUpdateParamsSchema>;
