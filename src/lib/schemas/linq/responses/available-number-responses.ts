import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const availableNumberRetrieveResponseSchema = z
  .object({
    phone_number: z.string(),
    vcf_url: z.string().url(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.AvailableNumberRetrieveResponse>;

export type AvailableNumberRetrieveResponse = z.infer<
  typeof availableNumberRetrieveResponseSchema
>;
