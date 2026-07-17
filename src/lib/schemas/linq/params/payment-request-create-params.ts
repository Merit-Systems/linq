import { z } from "zod";
import {
  paymentRequestCreateHeadersSchema,
  paymentRequestCreateParamsSchema,
} from "../payment-requests";
import { paymentRequestListParamsSchema } from "../pagination";

export {
  paymentRequestCreateParamsSchema,
  paymentRequestCreateHeadersSchema,
};

export { paymentRequestListParamsSchema };

export type PaymentRequestCreateParamsInput = z.infer<
  typeof paymentRequestCreateParamsSchema
>;
