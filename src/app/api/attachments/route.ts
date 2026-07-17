// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { attachmentCreateParamsSchema } from "@/lib/schemas/linq/params/attachment-create-params";
import { attachmentCreateResponseSchema } from "@/lib/schemas/linq/responses/attachment-responses";
import { handleAttachmentsCreate } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("attachments-create")
  .path("attachments")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(attachmentCreateParamsSchema)
  .output(attachmentCreateResponseSchema)
  .description("Optional media pre-upload for files >10MB (up to 100MB) or reuse across sends. POST metadata → attachment_id + presigned upload_url; PUT bytes, then reference attachment_id in message.parts. For ≤10MB, use a public HTTPS url in parts instead.")
  .handler(handleAttachmentsCreate);
