// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { handleMessagesCreate } from "./_shared/handlers";
import { messageCreateParamsSchema } from "@/lib/schemas/linq/params/message-create-params";
import { messageCreateResponseSchema } from "@/lib/schemas/linq/responses/message-responses";
import { quoteMessageSendPrice, maxMessageSendPrice } from "@/lib/routing/_shared/message-pricing";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("messages-create")
  .path("messages")
  .method("POST")
  .paid((body) => quoteMessageSendPrice("messages/create", body), { ...paidOpts(), maxPrice: maxMessageSendPrice() })
  .body(messageCreateParamsSchema)
  .output(messageCreateResponseSchema)
  .description("Send to recipient(s); reuses chats. New to line: $0.50/recipient, text-only opener (50/day). Warm: $0.05–$1.25 surge (6k/day). Mixed to[] bills cold + surge. Warm sends may include media (url ≤10MB or attachment_id).")
  .handler(handleMessagesCreate);
