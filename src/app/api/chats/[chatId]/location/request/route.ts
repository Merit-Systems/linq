import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { handleChatsLocationRequest } from "./_shared/handlers";
import { locationRequestResponseSchema } from "@/lib/schemas/linq/responses/location-responses";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("chats-location-request")
  .path("chats/:chatId/location/request")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .output(locationRequestResponseSchema)
  .description("Request location from chat participant.")
  .handler(handleChatsLocationRequest);
