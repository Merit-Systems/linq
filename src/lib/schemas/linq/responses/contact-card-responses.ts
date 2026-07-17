import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const setContactCardSchema = z
  .object({
    first_name: z.string(),
    is_active: z.boolean(),
    phone_number: z.string(),
    image_url: z.string().optional(),
    last_name: z.string().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.SetContactCard>;

export type SetContactCard = z.infer<typeof setContactCardSchema>;
