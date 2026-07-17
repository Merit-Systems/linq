import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { availableNumberRetrieveParamsSchema } from "@/lib/schemas/linq/params/available-number-retrieve-params";
import { availableNumberRetrieveResponseSchema } from "@/lib/schemas/linq/responses/available-number-responses";
import { handleAvailableNumberRetrieve } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";

export const GET = router
  .route("available-number-retrieve")
  .path("available-number")
  .method("GET")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .query(availableNumberRetrieveParamsSchema)
  .output(availableNumberRetrieveResponseSchema)
  .description("Find an available phone number.")
  .handler(handleAvailableNumberRetrieve);
