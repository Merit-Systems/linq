import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { emptyObjectSchema } from "@/lib/schemas/linq/common";
import { handleChatsMarkAsRead } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("chats-mark-as-read")
  .path("chats/:chatId/read")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .output(emptyObjectSchema)
  .description("Mark all messages in a chat as read.")
  .handler(handleChatsMarkAsRead);
