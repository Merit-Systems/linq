// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { emptyObjectSchema } from "@/lib/schemas/linq/common";
import { handleAttachmentsDelete } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";

export const DELETE = router
  .route("attachments-delete")
  .path("attachments/{attachmentId}")
  .method("DELETE")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .output(emptyObjectSchema)
  .description("Linq Attachments — Delete an unused pre-uploaded attachment.")
  .handler(handleAttachmentsDelete);
