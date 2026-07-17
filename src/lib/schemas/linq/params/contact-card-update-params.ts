import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const contactCardUpdateParamsSchema = z
  .object({
    phone_number: z.string(),
    first_name: z.string().optional(),
    image_url: z.string().url().optional(),
    last_name: z.string().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ContactCardUpdateParams>;

export const contactCardUpdateQuerySchema = contactCardUpdateParamsSchema.pick({
  phone_number: true,
});

export const contactCardUpdateBodySchema = contactCardUpdateParamsSchema.omit({
  phone_number: true,
});

export type ContactCardUpdateParams = z.infer<
  typeof contactCardUpdateParamsSchema
>;
