// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { handleMessagesUpdateAppCard } from "./_shared/handlers";
import { messageUpdateAppCardParamsSchema } from "@/lib/schemas/linq/params/message-update-app-card-params";
import { messageUpdateAppCardResponseSchema } from "@/lib/schemas/linq/responses/message-responses";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("messages-update-app-card")
  .path("messages/:messageId/update")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(messageUpdateAppCardParamsSchema)
  .output(messageUpdateAppCardResponseSchema)
  .description("Update an iMessage app card.")
  .handler(handleMessagesUpdateAppCard);
