import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const phoneNumberUpdateResponseSchema = z
  .object({
    id: z.string(),
    forwarding_number: z.string().nullable(),
    phone_number: z.string(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.PhoneNumberUpdateResponse>;
