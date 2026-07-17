import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const chatUpdateParamsSchema = z
  .object({
    display_name: z.string().optional(),
    group_chat_icon: z.string().url().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ChatUpdateParams>;

export type ChatUpdateParams = z.infer<typeof chatUpdateParamsSchema>;
