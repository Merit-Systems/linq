import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { webhookEventTypeSchema } from "../enums";

export const webhookSubscriptionCreateParamsSchema = z
  .object({
    subscribed_events: z.array(webhookEventTypeSchema).min(1),
    target_url: z.string().url(),
    phone_numbers: z.array(z.string()).optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.WebhookSubscriptionCreateParams>;

export type WebhookSubscriptionCreateParams = z.infer<
  typeof webhookSubscriptionCreateParamsSchema
>;
