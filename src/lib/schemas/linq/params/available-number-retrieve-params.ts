import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const availableNumberRetrieveParamsSchema = z
  .object({
    to: z.array(z.string()).optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.AvailableNumberRetrieveParams>;

export type AvailableNumberRetrieveParams = z.infer<
  typeof availableNumberRetrieveParamsSchema
>;
