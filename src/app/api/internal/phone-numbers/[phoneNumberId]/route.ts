// StableLinq backend: ops SIWX (line configuration — allowlisted wallet)
import { handlePhoneNumbersUpdate } from "./_shared/handlers";
import { phoneNumberUpdateParamsSchema } from "@/lib/schemas/linq/params/phone-number-update-params";
import { phoneNumberUpdateResponseSchema } from "@/lib/schemas/linq/responses/phone-number-responses";
import { router } from "@/lib/router";

export const PUT = router
  .route("phone-numbers-update")
  .path("internal/phone-numbers/:phoneNumberId")
  .method("PUT")
  .siwx()
  .body(phoneNumberUpdateParamsSchema)
  .output(phoneNumberUpdateResponseSchema)
  .description("Update phone number settings.")
  .handler(handlePhoneNumbersUpdate);
