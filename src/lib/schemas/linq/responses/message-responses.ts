import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { isoDateTimeSchema } from "../common";
import { statusTraceResponseSchema } from "../common";
import {
  deliveryStatusSchema,
  fromSelectionReasonSchema,
  serviceTypeSchema,
} from "../enums";
import { messageEffectSchema } from "../message-effect";
import { replyToSchema } from "../reply-to";
import {
  chatHandleSchema,
  messagePartResponseSchema,
} from "../shared-response";
import { sentMessageSchema } from "./chat-responses";

export const messageSchema = z
  .object({
    id: z.string(),
    chat_id: z.string(),
    created_at: isoDateTimeSchema,
    delivery_status: deliveryStatusSchema,
    is_delivered: z.boolean(),
    is_from_me: z.boolean(),
    is_read: z.boolean(),
    updated_at: isoDateTimeSchema,
    delivered_at: isoDateTimeSchema.nullish(),
    effect: messageEffectSchema.nullish(),
    from: z.string().nullish(),
    from_handle: chatHandleSchema.nullish(),
    parts: z.array(messagePartResponseSchema).nullish(),
    preferred_service: serviceTypeSchema.nullish(),
    read_at: isoDateTimeSchema.nullish(),
    reply_to: replyToSchema.nullish(),
    sent_at: isoDateTimeSchema.nullish(),
    service: serviceTypeSchema.nullish(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.Message>;

export const messageCreateFromSelectionSchema = z
  .object({
    reason: fromSelectionReasonSchema,
    reused_existing_chat: z.boolean(),
  })
  .strict();

export const messageCreateResponseSchema = z
  .object({
    chat_id: z.string(),
    created_new_chat: z.boolean(),
    from: z.string(),
    from_selection: messageCreateFromSelectionSchema,
    handles: z.array(chatHandleSchema),
    is_group: z.boolean(),
    message: sentMessageSchema,
    service: serviceTypeSchema,
    previous_chat_id: z.string().nullish(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.MessageCreateResponse>;

export const messageAddReactionResponseSchema =
  statusTraceResponseSchema satisfies z.ZodType<LinqAPIV3.MessageAddReactionResponse>;

export const messageUpdateAppCardResponseSchema = z
  .object({
    chat_id: z.string(),
    message: sentMessageSchema,
  })
  .strict() satisfies z.ZodType<LinqAPIV3.MessageUpdateAppCardResponse>;

export type Message = z.infer<typeof messageSchema>;
