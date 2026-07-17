import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { emptyObjectSchema } from "@/lib/schemas/linq/common";
import { handleChatsShareContactCard } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("chats-share-contact-card")
  .path("chats/:chatId/share-contact-card")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .output(emptyObjectSchema)
  .description("Share contact card with chat participants.")
  .handler(handleChatsShareContactCard);
