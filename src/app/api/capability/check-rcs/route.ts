// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { capabilityCheckRCSParamsSchema } from "@/lib/schemas/linq/params/capability-check-rcs-params";
import { handleCapabilityCheckRcs } from "./_shared/handlers";
import { handleCheckResponseSchema } from "@/lib/schemas/linq/responses/capability-responses";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("capability-check-rcs")
  .path("capability/check-rcs")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(capabilityCheckRCSParamsSchema)
  .output(handleCheckResponseSchema)
  .description("Linq Capability — Check whether handles support RCS.")
  .handler(handleCapabilityCheckRcs);
