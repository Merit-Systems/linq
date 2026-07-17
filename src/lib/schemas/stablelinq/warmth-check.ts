import { z } from "zod";
import { e164PhoneSchema } from "@/lib/schemas/linq/common";
import { MAX_CONSECUTIVE_UNANSWERED_OUTBOUND } from "@/lib/routing/_shared/constants";

export const warmthCheckParamsSchema = z
  .object({
    to: z.array(e164PhoneSchema).min(1),
  })
  .strict();

export const warmthCheckResultSchema = z.object({
  recipient: e164PhoneSchema,
  warmth: z.enum(["cold", "warm"]),
  chat_id: z.string().nullable(),
  consecutive_unanswered_outbound: z.number().int().min(0),
  send_blocked: z.boolean(),
});

export const messageSendPricingBreakdownSchema = z.object({
  cold_recipients: z.number().int().min(0),
  warm_recipients: z.number().int().min(0),
  cold_first_usd: z.string(),
  surge_slot_usd: z.string(),
  surge_slot_number: z.number().int().min(1),
});

export const warmthCheckResponseSchema = z.object({
  from_line: e164PhoneSchema,
  quoted_price_usd: z.string(),
  pricing_breakdown: messageSendPricingBreakdownSchema,
  pricing_note: z.string(),
  results: z.array(warmthCheckResultSchema),
});

export type WarmthCheckParams = z.infer<typeof warmthCheckParamsSchema>;
export type WarmthCheckResponse = z.infer<typeof warmthCheckResponseSchema>;

export function isSendBlocked(consecutiveUnansweredOutbound: number): boolean {
  return consecutiveUnansweredOutbound >= MAX_CONSECUTIVE_UNANSWERED_OUTBOUND;
}
