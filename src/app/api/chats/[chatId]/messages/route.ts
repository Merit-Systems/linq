import { handleChatsMessagesSend, handleChatsMessagesList } from "./_shared/handlers";
import { messageListParamsSchema } from "@/lib/schemas/linq/params/message-list-params";
import { messageSchema } from "@/lib/schemas/linq/responses/message-responses";
import { messageSendParamsSchema } from "@/lib/schemas/linq/params/message-send-params";
import { messageSendResponseSchema } from "@/lib/schemas/linq/responses/chat-responses";
import { quoteFollowUpMessagePrice, maxMessageSendPrice } from "@/lib/routing/_shared/message-pricing";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("chats-messages-send")
  .path("chats/:chatId/messages")
  .method("POST")
  .paid(() => quoteFollowUpMessagePrice(), { ...paidOpts(), maxPrice: maxMessageSendPrice() })
  .body(messageSendParamsSchema)
  .output(messageSendResponseSchema)
  .description("Send a message to an existing chat.")
  .handler(handleChatsMessagesSend);

export const GET = router
  .route("chats-messages-list")
  .path("chats/:chatId/messages")
  .method("GET")
  .siwx()
  .query(messageListParamsSchema)
  .output(messageSchema)
  .description("List messages in a chat.")
  .handler(handleChatsMessagesList);
