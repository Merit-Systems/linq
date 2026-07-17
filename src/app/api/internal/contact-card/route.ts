// StableLinq backend: ops SIWX (line configuration — allowlisted wallet)
import { contactCardCreateParamsSchema } from "@/lib/schemas/linq/params/contact-card-create-params";
import { contactCardUpdateParamsSchema } from "@/lib/schemas/linq/params/contact-card-update-params";
import { handleContactCardCreate, handleContactCardUpdate } from "./_shared/handlers";
import { router } from "@/lib/router";
import { setContactCardSchema } from "@/lib/schemas/linq/responses/contact-card-responses";

export const POST = router
  .route("contact-card-create")
  .path("internal/contact-card")
  .method("POST")
  .siwx()
  .body(contactCardCreateParamsSchema)
  .output(setContactCardSchema)
  .description("Create contact card configuration.")
  .handler(handleContactCardCreate);

export const PATCH = router
  .route("contact-card-update")
  .path("internal/contact-card")
  .method("PATCH")
  .siwx()
  .body(contactCardUpdateParamsSchema)
  .output(setContactCardSchema)
  .description("Update contact card configuration.")
  .handler(handleContactCardUpdate);
