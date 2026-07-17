// StableLinq backend: linq-read (Linq Partner API v3 — thread reads)
import { router } from "@/lib/router";
import {
  accountChatMessagesListParamsSchema,
  accountChatMessagesListResponseSchema,
} from "@/lib/schemas/stablelinq/chat-messages";
import { handleAccountChatMessagesList } from "./_shared/handlers";

export const GET = router
  .route("account-chats-messages-list")
  .path("account/chats/:chatId/messages")
  .method("GET")
  .siwx()
  .query(accountChatMessagesListParamsSchema)
  .output(accountChatMessagesListResponseSchema)
  .description(
    "[Linq read] List messages in a StableLinq chat thread (inbound replies + all line outbound). Requires a chat_id from a prior send. SIWX only.",
  )
  .handler(handleAccountChatMessagesList);
