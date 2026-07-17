import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { handlePaymentRequestsCreate, handlePaymentRequestsList } from "./_shared/handlers";
import { paymentRequestCreateParamsSchema } from "@/lib/schemas/linq/params/payment-request-create-params";
import { paymentRequestListParamsSchema } from "@/lib/schemas/linq/params/payment-request-list-params";
import { paymentRequestListResponseSchema } from "@/lib/schemas/linq/payment-requests";
import { paymentRequestSchema } from "@/lib/schemas/linq/payment-requests";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("payment-requests-create")
  .path("payment-requests")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(paymentRequestCreateParamsSchema)
  .output(paymentRequestSchema)
  .description("Create a Linq payment request (SDK gap — REST).")
  .handler(handlePaymentRequestsCreate);

export const GET = router
  .route("payment-requests-list")
  .path("payment-requests")
  .method("GET")
  .siwx()
  .query(paymentRequestListParamsSchema)
  .output(paymentRequestListResponseSchema)
  .description("List payment requests.")
  .handler(handlePaymentRequestsList);
