import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { imessageAppLayoutSchema } from "../message-parts";

export const messageUpdateAppCardParamsSchema = z
  .object({
    layout: imessageAppLayoutSchema,
    fallback_text: z.string().optional(),
    interactive: z.boolean().optional(),
    url: z.string().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.MessageUpdateAppCardParams>;

export type MessageUpdateAppCardParams = z.infer<
  typeof messageUpdateAppCardParamsSchema
>;
