import { z } from "zod";
import {
  stablelinqPaginationCursorSchema,
  stablelinqPaginationLimitSchema,
} from "@/lib/stablelinq/pagination";

export const accountChatsListParamsSchema = z
  .object({
    cursor: stablelinqPaginationCursorSchema,
    limit: stablelinqPaginationLimitSchema,
  })
  .strict();

export const accountChatSummarySchema = z.object({
  chatId: z.string(),
  recipients: z.array(z.string()),
  messageCount: z.number().int(),
  lastSentAt: z.string(),
  lastMessagePreview: z.string().nullable(),
  lastSlug: z.string(),
});

export const accountChatsListResponseSchema = z.object({
  chats: z.array(accountChatSummarySchema),
  next_cursor: z.string().nullable(),
});

export type AccountChatsListParams = z.infer<typeof accountChatsListParamsSchema>;
export type AccountChatSummary = z.infer<typeof accountChatSummarySchema>;
