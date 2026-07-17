// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { handleChatsMessagesSend } from "./_shared/handlers";
import { messageSendParamsSchema } from "@/lib/schemas/linq/params/message-send-params";
import { messageSendResponseSchema } from "@/lib/schemas/linq/responses/chat-responses";
import { quoteFollowUpMessagePrice } from "@/lib/routing/_shared/message-pricing";
import { maxMessagePrice } from "@/lib/pricing";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("chats-messages-send")
  .path("chats/{chatId}/messages")
  .method("POST")
  .paid(() => quoteFollowUpMessagePrice(), { ...paidOpts(), maxPrice: maxMessagePrice() })
  .body(messageSendParamsSchema)
  .output(messageSendResponseSchema)
  .description("Linq Chat Messages — Send a message to an existing chat. Media parts: { type: \"media\", url: \"https://...\" } (public HTTPS, ≤10MB) or { type: \"media\", attachment_id: \"...\" } after optional pre-upload via POST /api/attachments (>10MB up to 100MB, reuse across recipients, or lower latency).")
  .handler(handleChatsMessagesSend);
