import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { messageContentSchema } from "../message-content";

export const messageCreateParamsSchema = z
  .object({
    message: messageContentSchema,
    to: z.array(z.string()).min(1),
    continuation_message: z
      .object({
        text: z.string(),
      })
      .strict()
      .optional(),
    "Idempotency-Key": z.string().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.MessageCreateParams>;

export type MessageCreateParams = z.infer<typeof messageCreateParamsSchema>;
