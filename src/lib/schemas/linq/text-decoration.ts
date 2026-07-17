import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import {
  textDecorationAnimationSchema,
  textDecorationStyleSchema,
} from "./enums";

export const textDecorationSchema = z
  .object({
    range: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]),
    animation: textDecorationAnimationSchema.optional(),
    style: textDecorationStyleSchema.optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.TextDecoration>;

export type TextDecoration = z.infer<typeof textDecorationSchema>;
