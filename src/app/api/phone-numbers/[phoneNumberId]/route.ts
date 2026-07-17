import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { handlePhoneNumbersUpdate } from "./_shared/handlers";
import { phoneNumberUpdateParamsSchema } from "@/lib/schemas/linq/params/phone-number-update-params";
import { phoneNumberUpdateResponseSchema } from "@/lib/schemas/linq/responses/phone-number-responses";
import { router, paidOpts } from "@/lib/router";

export const PUT = router
  .route("phone-numbers-update")
  .path("phone-numbers/:phoneNumberId")
  .method("PUT")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(phoneNumberUpdateParamsSchema)
  .output(phoneNumberUpdateResponseSchema)
  .description("Update phone number settings.")
  .handler(handlePhoneNumbersUpdate);
