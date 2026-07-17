import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { attachmentRetrieveResponseSchema } from "@/lib/schemas/linq/responses/attachment-responses";
import { emptyObjectSchema } from "@/lib/schemas/linq/common";
import { handleAttachmentsRetrieve, handleAttachmentsDelete } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";

export const GET = router
  .route("attachments-retrieve")
  .path("attachments/:attachmentId")
  .method("GET")
  .siwx()
  .output(attachmentRetrieveResponseSchema)
  .description("Retrieve attachment metadata.")
  .handler(handleAttachmentsRetrieve);

export const DELETE = router
  .route("attachments-delete")
  .path("attachments/:attachmentId")
  .method("DELETE")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .output(emptyObjectSchema)
  .description("Delete an attachment.")
  .handler(handleAttachmentsDelete);
