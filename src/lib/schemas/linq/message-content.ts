import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { serviceTypeSchema } from "./enums";
import { messageEffectSchema } from "./message-effect";
import { messagePartSchema } from "./message-parts";
import { replyToSchema } from "./reply-to";

export const messageContentSchema = z
  .object({
    parts: z.array(messagePartSchema).min(1).max(100),
    effect: messageEffectSchema.optional(),
    idempotency_key: z.string().optional(),
    preferred_service: serviceTypeSchema.optional(),
    reply_to: replyToSchema.optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.MessageContent>;

export type MessageContent = z.infer<typeof messageContentSchema>;
