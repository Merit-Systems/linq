// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { handleMessagesAddReaction } from "./_shared/handlers";
import { messageAddReactionParamsSchema } from "@/lib/schemas/linq/params/message-add-reaction-params";
import { messageAddReactionResponseSchema } from "@/lib/schemas/linq/responses/message-responses";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("messages-add-reaction")
  .path("messages/:messageId/reactions")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(messageAddReactionParamsSchema)
  .output(messageAddReactionResponseSchema)
  .description("Add a reaction to a message.")
  .handler(handleMessagesAddReaction);
