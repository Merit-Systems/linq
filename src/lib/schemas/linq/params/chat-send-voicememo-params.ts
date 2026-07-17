import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const chatSendVoicememoParamsSchema = z
  .object({
    attachment_id: z.string().optional(),
    voice_memo_url: z.string().url().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ChatSendVoicememoParams>;

export type ChatSendVoicememoParams = z.infer<
  typeof chatSendVoicememoParamsSchema
>;
