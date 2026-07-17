import { z } from "zod";
import {
  stablelinqPaginationCursorSchema,
  stablelinqPaginationLimitSchema,
} from "@/lib/stablelinq/pagination";

export const sentMessagesListParamsSchema = z
  .object({
    cursor: stablelinqPaginationCursorSchema,
    limit: stablelinqPaginationLimitSchema,
    chatId: z.string().optional(),
  })
  .strict();

export const sentMessageSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  fromLine: z.string(),
  recipients: z.array(z.string()),
  chatId: z.string().nullable(),
  linqMessageId: z.string().nullable(),
  priceUsd: z.string(),
  coldRecipientCount: z.number().int(),
  warmRecipientCount: z.number().int(),
  messagePreview: z.string().nullable(),
  createdAt: z.string(),
});

export const sentMessagesListResponseSchema = z.object({
  sent_messages: z.array(sentMessageSummarySchema),
  next_cursor: z.string().nullable(),
});

export const sentMessageDetailSchema = sentMessageSummarySchema.extend({
  requestBody: z.unknown(),
  linqResponse: z.unknown().nullable(),
});

export const sentMessageIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type SentMessagesListParams = z.infer<typeof sentMessagesListParamsSchema>;
export type SentMessageSummary = z.infer<typeof sentMessageSummarySchema>;
export type SentMessageDetail = z.infer<typeof sentMessageDetailSchema>;
