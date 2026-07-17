// StableLinq backend: linq-read (Linq Partner API v3 — thread reads)
import { router } from "@/lib/router";
import {
  accountChatMessagesListParamsSchema,
  accountChatMessagesListResponseSchema,
} from "@/lib/schemas/stablelinq/chat-messages";
import { handleAccountChatMessagesList } from "./_shared/handlers";

export const GET = router
  .route("account-chats-messages-list")
  .path("account/chats/{chatId}/messages")
  .method("GET")
  .siwx()
  .query(accountChatMessagesListParamsSchema)
  .output(accountChatMessagesListResponseSchema)
  .description(
    "List messages in a chat thread (inbound replies and all line outbound). Requires a chat_id from a prior send. Requires SIWX wallet auth.",
  )
  .handler(handleAccountChatMessagesList);
