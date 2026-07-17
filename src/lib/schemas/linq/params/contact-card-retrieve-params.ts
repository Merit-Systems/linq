import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const contactCardRetrieveParamsSchema = z
  .object({
    phone_number: z.string().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ContactCardRetrieveParams>;

export type ContactCardRetrieveParams = z.infer<
  typeof contactCardRetrieveParamsSchema
>;
