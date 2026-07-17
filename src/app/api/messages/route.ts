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
  .description("Send a message to one or more recipients (cold start or warm). Reuses an existing chat when possible. First contact to a new recipient must be text-only (no links/media/URLs). Outbound-first pricing applies per new recipient (50/day cap).")
  .handler(handleMessagesCreate);
