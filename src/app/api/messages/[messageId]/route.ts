// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { emptyObjectSchema } from "@/lib/schemas/linq/common";
import { handleMessagesDelete, handleMessagesUpdate } from "./_shared/handlers";
import { messageSchema } from "@/lib/schemas/linq/responses/message-responses";
import { messageUpdateParamsSchema } from "@/lib/schemas/linq/params/message-update-params";
import { router, paidOpts } from "@/lib/router";

export const DELETE = router
  .route("messages-delete")
  .path("messages/{messageId}")
  .method("DELETE")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .output(emptyObjectSchema)
  .description("Linq Messages — Delete a message.")
  .handler(handleMessagesDelete);

export const PATCH = router
  .route("messages-update")
  .path("messages/{messageId}")
  .method("PATCH")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(messageUpdateParamsSchema)
  .output(messageSchema)
  .description("Linq Messages — Edit a message.")
  .handler(handleMessagesUpdate);
