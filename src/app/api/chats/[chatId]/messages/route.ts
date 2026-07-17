// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { handleChatsMessagesSend } from "./_shared/handlers";
import { messageSendParamsSchema } from "@/lib/schemas/linq/params/message-send-params";
import { messageSendResponseSchema } from "@/lib/schemas/linq/responses/chat-responses";
import { quoteFollowUpMessagePrice } from "@/lib/routing/_shared/message-pricing";
import { maxMessagePrice } from "@/lib/pricing";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";
import { assertUnansweredOutboundAllowedForChat } from "@/lib/routing/_shared/unanswered-outbound-validate";
import { router, paidOpts } from "@/lib/router";

const postHandler = router
  .route("chats-messages-send")
  .path("chats/{chatId}/messages")
  .method("POST")
  .paid(() => quoteFollowUpMessagePrice(), { ...paidOpts(), maxPrice: maxMessagePrice() })
  .body(messageSendParamsSchema)
  .output(messageSendResponseSchema)
  .description("Linq Chat Messages — Send a message to an existing chat. Media parts: { type: \"media\", url: \"https://...\" } (public HTTPS, ≤10MB) or { type: \"media\", attachment_id: \"...\" } after optional pre-upload via POST /api/attachments (>10MB up to 100MB, reuse across recipients, or lower latency).")
  .handler(handleChatsMessagesSend);

export async function POST(request: Request) {
  const chatId = pathParamFromRequest(request, "chatId");
  await assertUnansweredOutboundAllowedForChat(chatId);
  return postHandler(request);
}
