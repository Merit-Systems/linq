import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { chatSchema } from "@/lib/schemas/linq/responses/chat-responses";
import { chatUpdateParamsSchema } from "@/lib/schemas/linq/params/chat-update-params";
import { chatUpdateResponseSchema } from "@/lib/schemas/linq/responses/chat-responses";
import { handleChatsRetrieve, handleChatsUpdate } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";

export const GET = router
  .route("chats-retrieve")
  .path("chats/:chatId")
  .method("GET")
  .siwx()
  .output(chatSchema)
  .description("Retrieve a chat by ID.")
  .handler(handleChatsRetrieve);

export const PUT = router
  .route("chats-update")
  .path("chats/:chatId")
  .method("PUT")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(chatUpdateParamsSchema)
  .output(chatUpdateResponseSchema)
  .description("Update chat display name or group icon.")
  .handler(handleChatsUpdate);
