// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { chatSendVoicememoParamsSchema } from "@/lib/schemas/linq/params/chat-send-voicememo-params";
import { chatSendVoicememoResponseSchema } from "@/lib/schemas/linq/responses/chat-responses";
import { handleChatsSendVoicememo } from "./_shared/handlers";
import { quoteFollowUpMessagePrice } from "@/lib/routing/_shared/message-pricing";
import { maxMessagePrice } from "@/lib/pricing";
import { validateColdOutbound } from "@/lib/routing/_shared/first-message-validate";
import { assertUnansweredOutboundAllowedForChat } from "@/lib/routing/_shared/unanswered-outbound-validate";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";
import { withRouteGuard } from "@/lib/routing/_shared/route-guard";
import { router, paidOpts } from "@/lib/router";

const postHandler = router
  .route("chats-send-voicememo")
  .path("chats/{chatId}/voicememo")
  .method("POST")
  .paid(() => quoteFollowUpMessagePrice(), { ...paidOpts(), maxPrice: maxMessagePrice() })
  .body(chatSendVoicememoParamsSchema)
  .output(chatSendVoicememoResponseSchema)
  .description("Linq Voice Memo — Send an iMessage voice memo to a chat.")
  .handler(handleChatsSendVoicememo);

export async function POST(request: Request) {
  return withRouteGuard(async () => {
    const chatId = pathParamFromRequest(request, "chatId");
    await validateColdOutbound("chats/send-voicememo", { request });
    await assertUnansweredOutboundAllowedForChat(chatId);
    return postHandler(request);
  });
}
