import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { emptyObjectSchema } from "@/lib/schemas/linq/common";
import { handleChatsTypingStart, handleChatsTypingStop } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("chats-typing-start")
  .path("chats/:chatId/typing")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .output(emptyObjectSchema)
  .description("Start typing indicator.")
  .handler(handleChatsTypingStart);

export const DELETE = router
  .route("chats-typing-stop")
  .path("chats/:chatId/typing")
  .method("DELETE")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .output(emptyObjectSchema)
  .description("Stop typing indicator.")
  .handler(handleChatsTypingStop);
