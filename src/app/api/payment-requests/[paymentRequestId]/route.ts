import { handlePaymentRequestsRetrieve } from "./_shared/handlers";
import { paymentRequestSchema } from "@/lib/schemas/linq/payment-requests";
import { router } from "@/lib/router";

export const GET = router
  .route("payment-requests-retrieve")
  .path("payment-requests/:paymentRequestId")
  .method("GET")
  .siwx()
  .output(paymentRequestSchema)
  .description("Retrieve a payment request.")
  .handler(handlePaymentRequestsRetrieve);
