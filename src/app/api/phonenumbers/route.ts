import { handlePhonenumbersList } from "./_shared/handlers";
import { phonenumberListResponseSchema } from "@/lib/schemas/linq/responses/phone-number-responses";
import { router } from "@/lib/router";

export const GET = router
  .route("phonenumbers-list")
  .path("phonenumbers")
  .method("GET")
  .siwx()
  .output(phonenumberListResponseSchema)
  .description("List phonenumbers (alternate API).")
  .handler(handlePhonenumbersList);
