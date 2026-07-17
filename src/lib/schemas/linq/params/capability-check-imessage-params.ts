import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const capabilityCheckIMessageParamsSchema = z
  .object({
    address: z.string(),
    from: z.string().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.CapabilityCheckIMessageParams>;

export type CapabilityCheckIMessageParams = z.infer<
  typeof capabilityCheckIMessageParamsSchema
>;
