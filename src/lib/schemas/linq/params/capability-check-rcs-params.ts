import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const capabilityCheckRCSParamsSchema = z
  .object({
    address: z.string(),
    from: z.string().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.CapabilityCheckRCSParams>;

export type CapabilityCheckRCSParams = z.infer<
  typeof capabilityCheckRCSParamsSchema
>;
