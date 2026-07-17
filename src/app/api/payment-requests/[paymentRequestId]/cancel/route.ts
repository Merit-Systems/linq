import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { handlePaymentRequestsCancel } from "./_shared/handlers";
import { paymentRequestSchema } from "@/lib/schemas/linq/payment-requests";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("payment-requests-cancel")
  .path("payment-requests/:paymentRequestId/cancel")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .output(paymentRequestSchema)
  .description("Cancel a payment request.")
  .handler(handlePaymentRequestsCancel);
