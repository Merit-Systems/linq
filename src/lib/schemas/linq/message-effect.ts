import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import {
  bubbleEffectNameSchema,
  messageEffectTypeSchema,
  screenEffectNameSchema,
} from "./enums";

export const messageEffectNameSchema = z.union([
  screenEffectNameSchema,
  bubbleEffectNameSchema,
]);

export const messageEffectSchema = z
  .object({
    name: messageEffectNameSchema.optional(),
    type: messageEffectTypeSchema.optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.MessageEffect>;

export type MessageEffect = z.infer<typeof messageEffectSchema>;
