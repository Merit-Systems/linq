import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { textDecorationSchema } from "./text-decoration";

export const imessageAppLayoutSchema = z
  .object({
    caption: z.string().optional(),
    image_subtitle: z.string().optional(),
    image_title: z.string().optional(),
    image_url: z.string().url().optional(),
    subcaption: z.string().optional(),
    trailing_caption: z.string().optional(),
    trailing_subcaption: z.string().optional(),
  })
  .strict();

export const imessageAppAppSchema = z
  .object({
    bundle_id: z.string(),
    name: z.string(),
    team_id: z.string(),
    app_store_id: z.number().int().optional(),
  })
  .strict();

export const textPartSchema = z
  .object({
    type: z.literal("text"),
    value: z.string(),
    text_decorations: z.array(textDecorationSchema).optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.TextPart>;

export const mediaPartSchema = z
  .object({
    type: z.literal("media"),
    attachment_id: z.string().optional(),
    url: z.string().url().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.MediaPart>;

export const linkPartSchema = z
  .object({
    type: z.literal("link"),
    value: z.string().url(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.LinkPart>;

export const imessageAppPartSchema = z
  .object({
    type: z.literal("imessage_app"),
    app: imessageAppAppSchema,
    layout: imessageAppLayoutSchema,
    fallback_text: z.string().optional(),
    interactive: z.boolean().optional(),
    url: z.string().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.MessageContent.IMessageAppPart>;

export const messagePartSchema = z.discriminatedUnion("type", [
  textPartSchema,
  mediaPartSchema,
  linkPartSchema,
  imessageAppPartSchema,
]);

export type TextPart = z.infer<typeof textPartSchema>;
export type MediaPart = z.infer<typeof mediaPartSchema>;
export type LinkPart = z.infer<typeof linkPartSchema>;
export type IMessageAppPart = z.infer<typeof imessageAppPartSchema>;
export type MessagePart = z.infer<typeof messagePartSchema>;
