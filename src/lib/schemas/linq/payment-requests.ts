/**
 * Payment request schemas — SDK gap (REST-only in @linqapp/sdk@0.28.2).
 * Derived from Linq OpenAPI / llms-full.txt payment_requests resource.
 */
import { z } from "zod";
import { isoDateTimeSchema } from "./common";
import {
  paymentRequestModeSchema,
  paymentRequestStatusSchema,
  subscriptionIntervalSchema,
} from "./enums";

export const paymentRequestStripeSchema = z
  .object({
    customer_id: z.string().optional(),
    payment_intent_id: z.string().optional(),
    subscription_id: z.string().optional(),
  })
  .strict();

export const paymentRequestSchema = z
  .object({
    id: z.string(),
    amount: z.number(),
    checkout_url: z.string().url(),
    created_at: isoDateTimeSchema,
    currency: z.string(),
    mode: paymentRequestModeSchema,
    object: z.literal("payment_request"),
    status: paymentRequestStatusSchema,
    description: z.string().optional(),
    expires_at: isoDateTimeSchema.optional(),
    interval: subscriptionIntervalSchema.optional(),
    interval_count: z.number().int().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    paid_at: isoDateTimeSchema.optional(),
    price_id: z.string().optional(),
    quantity: z.number().int().optional(),
    stripe: paymentRequestStripeSchema.optional(),
    trial_end: isoDateTimeSchema.optional(),
    updated_at: isoDateTimeSchema.optional(),
  })
  .strict();

export const paymentRequestListResponseSchema = z
  .object({
    data: z.array(paymentRequestSchema),
    has_more: z.boolean(),
    object: z.literal("list"),
  })
  .strict();

export const paymentRequestCreateParamsSchema = z
  .object({
    amount: z.number().int().optional(),
    currency: z.string().optional(),
    customer_id: z.string().optional(),
    description: z.string().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    mode: paymentRequestModeSchema.optional(),
    price_id: z.string().optional(),
    quantity: z.number().int().optional(),
    trial_end: isoDateTimeSchema.optional(),
    trial_period_days: z.number().int().optional(),
  })
  .strict();

export const paymentRequestCreateHeadersSchema = z
  .object({
    "Idempotency-Key": z.string().optional(),
  })
  .strict();

export type PaymentRequest = z.infer<typeof paymentRequestSchema>;
export type PaymentRequestListResponse = z.infer<
  typeof paymentRequestListResponseSchema
>;
export type PaymentRequestCreateParams = z.infer<
  typeof paymentRequestCreateParamsSchema
>;
