import { z } from "zod";
import { listMessagesPaginationParamsSchema } from "@/lib/schemas/linq/pagination";
import { messageSchema } from "@/lib/schemas/linq/responses/message-responses";

export const accountChatMessagesListParamsSchema =
  listMessagesPaginationParamsSchema;

export const accountChatMessagesListResponseSchema = z.object({
  messages: z.array(messageSchema),
  next_cursor: z.string().nullable(),
});

export type AccountChatMessagesListParams = z.infer<
  typeof accountChatMessagesListParamsSchema
>;
export type AccountChatMessagesListResponse = z.infer<
  typeof accountChatMessagesListResponseSchema
>;
