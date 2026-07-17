import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { contactCardCreateParamsSchema } from "@/lib/schemas/linq/params/contact-card-create-params";
import { contactCardRetrieveParamsSchema } from "@/lib/schemas/linq/params/contact-card-retrieve-params";
import { contactCardRetrieveResponseSchema } from "@/lib/schemas/linq/responses/contact-card-responses";
import { contactCardUpdateParamsSchema } from "@/lib/schemas/linq/params/contact-card-update-params";
import { handleContactCardRetrieve, handleContactCardCreate, handleContactCardUpdate } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";
import { setContactCardSchema } from "@/lib/schemas/linq/responses/contact-card-responses";

export const GET = router
  .route("contact-card-retrieve")
  .path("contact-card")
  .method("GET")
  .siwx()
  .query(contactCardRetrieveParamsSchema)
  .output(contactCardRetrieveResponseSchema)
  .description("Retrieve contact card configuration.")
  .handler(handleContactCardRetrieve);

export const POST = router
  .route("contact-card-create")
  .path("contact-card")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(contactCardCreateParamsSchema)
  .output(setContactCardSchema)
  .description("Create contact card configuration.")
  .handler(handleContactCardCreate);

export const PATCH = router
  .route("contact-card-update")
  .path("contact-card")
  .method("PATCH")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(contactCardUpdateParamsSchema)
  .output(setContactCardSchema)
  .description("Update contact card configuration.")
  .handler(handleContactCardUpdate);
