import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { isoDateTimeSchema } from "../common";
import { webhookEventTypeSchema } from "../enums";

export const webhookSubscriptionSchema = z
  .object({
    id: z.string(),
    created_at: isoDateTimeSchema,
    is_active: z.boolean(),
    subscribed_events: z.array(webhookEventTypeSchema),
    target_url: z.string().url(),
    updated_at: isoDateTimeSchema,
    phone_numbers: z.array(z.string()).nullish(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.WebhookSubscription>;

export const webhookSubscriptionCreateResponseSchema = webhookSubscriptionSchema
  .extend({
    signing_secret: z.string(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.WebhookSubscriptionCreateResponse>;

export const webhookSubscriptionListResponseSchema = z
  .object({
    subscriptions: z.array(webhookSubscriptionSchema),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.WebhookSubscriptionListResponse>;

export const webhookEventListResponseSchema = z
  .object({
    doc_url: z.literal("https://docs.linqapp.com/guides/webhooks/events"),
    events: z.array(webhookEventTypeSchema),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.WebhookEventListResponse>;
