import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const handleCheckResponseSchema = z
  .object({
    address: z.string(),
    available: z.boolean(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.HandleCheckResponse>;

export type HandleCheckResponse = z.infer<typeof handleCheckResponseSchema>;
