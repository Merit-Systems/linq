import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { reactionOperationSchema, reactionTypeSchema } from "../enums";

export const messageAddReactionParamsSchema = z
  .object({
    operation: reactionOperationSchema,
    type: reactionTypeSchema,
    custom_emoji: z.string().optional(),
    part_index: z.number().int().nonnegative().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.MessageAddReactionParams>;

export type MessageAddReactionParams = z.infer<
  typeof messageAddReactionParamsSchema
>;
