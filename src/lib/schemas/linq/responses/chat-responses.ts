import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { isoDateTimeSchema } from "../common";
import {
  chatHealthStatusSchema,
  deliveryStatusSchema,
  serviceTypeSchema,
} from "../enums";
import { messageEffectSchema } from "../message-effect";
import { messagePartResponseSchema } from "../shared-response";
import { chatHandleSchema } from "../shared-response";
import { replyToSchema } from "../reply-to";

export const chatHealthStatusObjectSchema = z
  .object({
    doc_url: z.string(),
    status: chatHealthStatusSchema,
    updated_at: isoDateTimeSchema,
  })
  .strict();

export const sentMessageSchema = z
  .object({
    id: z.string(),
    created_at: isoDateTimeSchema,
    delivery_status: deliveryStatusSchema,
    is_read: z.boolean(),
    parts: z.array(messagePartResponseSchema),
    sent_at: isoDateTimeSchema.nullable(),
    delivered_at: isoDateTimeSchema.nullish(),
    effect: messageEffectSchema.nullish(),
    from_handle: chatHandleSchema.nullish(),
    preferred_service: serviceTypeSchema.nullish(),
    reply_to: replyToSchema.nullish(),
    service: serviceTypeSchema.nullish(),
  })
  .strict();

export const chatSendVoicememoResponseSchema = z
  .object({
    voice_memo: z.object({
      id: z.string(),
      chat: z.object({
        id: z.string(),
        handles: z.array(chatHandleSchema),
        is_active: z.boolean(),
        is_group: z.boolean(),
        service: serviceTypeSchema,
      }),
      created_at: isoDateTimeSchema,
      from: z.string(),
      status: z.string(),
      to: z.array(z.string()),
      voice_memo: z.object({
        id: z.string(),
        filename: z.string(),
        mime_type: z.string(),
        size_bytes: z.number(),
        url: z.string(),
        duration_ms: z.number().nullish(),
      }),
      service: serviceTypeSchema.nullish(),
    }),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ChatSendVoicememoResponse>;

export const messageSendResponseSchema = z
  .object({
    chat_id: z.string(),
    message: sentMessageSchema,
  })
  .strict();

export type SentMessage = z.infer<typeof sentMessageSchema>;
