import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { webhookEventTypeSchema } from "../enums";

export const webhookSubscriptionUpdateParamsSchema = z
  .object({
    is_active: z.boolean().optional(),
    phone_numbers: z.array(z.string()).nullable().optional(),
    subscribed_events: z.array(webhookEventTypeSchema).optional(),
    target_url: z.string().url().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.WebhookSubscriptionUpdateParams>;

export type WebhookSubscriptionUpdateParams = z.infer<
  typeof webhookSubscriptionUpdateParamsSchema
>;
