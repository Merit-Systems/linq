import { handlePhoneNumbersList } from "./_shared/handlers";
import { phoneNumberListResponseSchema } from "@/lib/schemas/linq/responses/phone-number-responses";
import { router } from "@/lib/router";

export const GET = router
  .route("phone-numbers-list")
  .path("phone-numbers")
  .method("GET")
  .siwx()
  .output(phoneNumberListResponseSchema)
  .description("List phone numbers.")
  .handler(handlePhoneNumbersList);
