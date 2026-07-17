// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { handleMessagesCreate } from "./_shared/handlers";
import { messageCreateParamsSchema } from "@/lib/schemas/linq/params/message-create-params";
import { messageCreateResponseSchema } from "@/lib/schemas/linq/responses/message-responses";
import {
  quoteMessageSendPrice,
  maxMessageSendPrice,
  buildMessagesCheckoutSession,
} from "@/lib/routing/_shared/message-pricing";
import { validateColdOutbound } from "@/lib/routing/_shared/first-message-validate";
import { assertUnansweredOutboundAllowed } from "@/lib/routing/_shared/unanswered-outbound-validate";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("messages-create")
  .path("messages")
  .method("POST")
  .paid((body) => quoteMessageSendPrice("messages/create", body), {
    ...paidOpts(),
    maxPrice: maxMessageSendPrice(),
    checkoutSession: ({ body, price }) =>
      buildMessagesCheckoutSession({ body, price }),
  })
  .body(messageCreateParamsSchema)
  .validate(async (body) => {
    await validateColdOutbound("messages/create", { body });
    await assertUnansweredOutboundAllowed({ slug: "messages/create", body });
  })
  .output(messageCreateResponseSchema)
  .description(
    "Linq Messages — Send on iMessage, fallback to RCS then SMS. Reuses existing chats. Required: call POST /api/messages/warmth before stating cold/warm or quoting send cost (returns quoted_price_usd). Pay only the quoted amount on send; maxPrice is an authorization ceiling, not the send cost. Cold openers must be text-only. See discovery guidance for pricing, media, and overrides.",
  )
  .handler(handleMessagesCreate);
