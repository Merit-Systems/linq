import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const replyToSchema = z
  .object({
    message_id: z.string(),
    part_index: z.number().int().nonnegative().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ReplyTo>;

export type ReplyTo = z.infer<typeof replyToSchema>;
