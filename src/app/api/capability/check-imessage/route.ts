import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { capabilityCheckIMessageParamsSchema } from "@/lib/schemas/linq/params/capability-check-imessage-params";
import { handleCapabilityCheckImessage } from "./_shared/handlers";
import { handleCheckResponseSchema } from "@/lib/schemas/linq/responses/capability-responses";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("capability-check-imessage")
  .path("capability/check-imessage")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(capabilityCheckIMessageParamsSchema)
  .output(handleCheckResponseSchema)
  .description("Check whether handles support iMessage.")
  .handler(handleCapabilityCheckImessage);
