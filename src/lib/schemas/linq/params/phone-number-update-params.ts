import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const phoneNumberUpdateParamsSchema = z
  .object({
    forwarding_number: z.string().nullable(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.PhoneNumberUpdateParams>;

export type PhoneNumberUpdateParams = z.infer<
  typeof phoneNumberUpdateParamsSchema
>;
