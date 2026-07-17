import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { isoDateTimeSchema } from "./common";
import {
  participantStatusSchema,
  reactionTypeSchema,
  serviceTypeSchema,
} from "./enums";
import {
  imessageAppAppSchema,
  imessageAppLayoutSchema,
} from "./message-parts";
import { textDecorationSchema } from "./text-decoration";

export const chatHandleSchema = z
  .object({
    id: z.string(),
    handle: z.string(),
    joined_at: isoDateTimeSchema,
    service: serviceTypeSchema,
    is_me: z.boolean().nullish(),
    left_at: isoDateTimeSchema.nullish(),
    status: participantStatusSchema.nullish(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ChatHandle>;

export const reactionStickerSchema = z
  .object({
    file_name: z.string().optional(),
    height: z.number().optional(),
    mime_type: z.string().optional(),
    url: z.string().optional(),
    width: z.number().optional(),
  })
  .strict();

export const reactionSchema = z
  .object({
    handle: chatHandleSchema,
    is_me: z.boolean(),
    type: reactionTypeSchema,
    custom_emoji: z.string().nullish(),
    sticker: reactionStickerSchema.nullish(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.Reaction>;

export const textPartResponseSchema = z
  .object({
    type: z.literal("text"),
    value: z.string(),
    reactions: z.array(reactionSchema).nullable(),
    text_decorations: z.array(textDecorationSchema).nullish(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.TextPartResponse>;

export const mediaPartResponseSchema = z
  .object({
    type: z.literal("media"),
    id: z.string(),
    filename: z.string(),
    mime_type: z.string(),
    reactions: z.array(reactionSchema).nullable(),
    size_bytes: z.number(),
    url: z.string(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.MediaPartResponse>;

export const linkPartResponseSchema = z
  .object({
    type: z.literal("link"),
    value: z.string(),
    reactions: z.array(reactionSchema).nullable(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.LinkPartResponse>;

export const imessageAppPartResponseSchema = z
  .object({
    type: z.literal("imessage_app"),
    app: imessageAppAppSchema,
    layout: imessageAppLayoutSchema,
    reactions: z.array(reactionSchema).nullable(),
    url: z.string(),
    fallback_text: z.string().nullish(),
  })
  .strict();

export const messagePartResponseSchema = z.discriminatedUnion("type", [
  textPartResponseSchema,
  mediaPartResponseSchema,
  linkPartResponseSchema,
  imessageAppPartResponseSchema,
]);

export type ChatHandle = z.infer<typeof chatHandleSchema>;
export type Reaction = z.infer<typeof reactionSchema>;
export type TextPartResponse = z.infer<typeof textPartResponseSchema>;
export type MediaPartResponse = z.infer<typeof mediaPartResponseSchema>;
export type LinkPartResponse = z.infer<typeof linkPartResponseSchema>;
