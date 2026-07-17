import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { chatLeaveChatResponseSchema } from "@/lib/schemas/linq/responses/chat-responses";
import { handleChatsLeave } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("chats-leave")
  .path("chats/:chatId/leave")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .output(chatLeaveChatResponseSchema)
  .description("Leave a group chat.")
  .handler(handleChatsLeave);
