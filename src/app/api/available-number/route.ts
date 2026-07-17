// StableLinq backend: ops SIWX (line configuration — allowlisted wallet)
import { availableNumberRetrieveParamsSchema } from "@/lib/schemas/linq/params/available-number-retrieve-params";
import { availableNumberRetrieveResponseSchema } from "@/lib/schemas/linq/responses/available-number-responses";
import { handleAvailableNumberRetrieve } from "./_shared/handlers";
import { router } from "@/lib/router";

export const GET = router
  .route("available-number-retrieve")
  .path("available-number")
  .method("GET")
  .siwx()
  .query(availableNumberRetrieveParamsSchema)
  .output(availableNumberRetrieveResponseSchema)
  .description("Find an available phone number.")
  .handler(handleAvailableNumberRetrieve);
