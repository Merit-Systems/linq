import { getChatLocationResponseSchema } from "@/lib/schemas/linq/responses/location-responses";
import { handleChatsLocationRetrieve } from "./_shared/handlers";
import { router } from "@/lib/router";

export const GET = router
  .route("chats-location-retrieve")
  .path("chats/:chatId/location")
  .method("GET")
  .siwx()
  .output(getChatLocationResponseSchema)
  .description("Get shared location for a chat.")
  .handler(handleChatsLocationRetrieve);
