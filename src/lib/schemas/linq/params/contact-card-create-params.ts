import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const contactCardCreateParamsSchema = z
  .object({
    first_name: z.string(),
    phone_number: z.string(),
    image_url: z.string().url().optional(),
    last_name: z.string().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ContactCardCreateParams>;

export type ContactCardCreateParams = z.infer<
  typeof contactCardCreateParamsSchema
>;
