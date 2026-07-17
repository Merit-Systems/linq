import { chatCreateAgentParamsSchema } from "@/lib/schemas/linq/params/chat-create-params";
import { chatCreateResponseSchema } from "@/lib/schemas/linq/responses/chat-responses";
import { chatListChatsParamsSchema } from "@/lib/schemas/linq/params/chat-list-chats-params";
import { chatSchema } from "@/lib/schemas/linq/responses/chat-responses";
import { handleChatsCreate, handleChatsList } from "./_shared/handlers";
import { quoteMessageSendPrice, maxMessageSendPrice } from "@/lib/routing/_shared/message-pricing";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("chats-create")
  .path("chats")
  .method("POST")
  .paid((body) => quoteMessageSendPrice("chats/create", body), { ...paidOpts(), maxPrice: maxMessageSendPrice() })
  .body(chatCreateAgentParamsSchema)
  .output(chatCreateResponseSchema)
  .description("Create a chat and send the initial message. First message must be text-only (no links/media/URLs). Outbound-first pricing applies per new recipient (50/day cap).")
  .handler(handleChatsCreate);

export const GET = router
  .route("chats-list")
  .path("chats")
  .method("GET")
  .siwx()
  .query(chatListChatsParamsSchema)
  .output(chatSchema)
  .description("List chats with optional from/to filters and pagination.")
  .handler(handleChatsList);
