// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { chatSendVoicememoParamsSchema } from "@/lib/schemas/linq/params/chat-send-voicememo-params";
import { chatSendVoicememoResponseSchema } from "@/lib/schemas/linq/responses/chat-responses";
import { handleChatsSendVoicememo } from "./_shared/handlers";
import { quoteFollowUpMessagePrice } from "@/lib/routing/_shared/message-pricing";
import { maxMessagePrice } from "@/lib/pricing";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("chats-send-voicememo")
  .path("chats/{chatId}/voicememo")
  .method("POST")
  .paid(() => quoteFollowUpMessagePrice(), { ...paidOpts(), maxPrice: maxMessagePrice() })
  .body(chatSendVoicememoParamsSchema)
  .output(chatSendVoicememoResponseSchema)
  .description("Linq Voice Memo — Send an iMessage voice memo to a chat.")
  .handler(handleChatsSendVoicememo);
