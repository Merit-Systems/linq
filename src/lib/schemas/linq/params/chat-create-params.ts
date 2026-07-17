import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { agentParamsWithoutFrom } from "../agent-params";
import { messageContentSchema } from "../message-content";

export const chatCreateParamsSchema = z
  .object({
    from: z.string(),
    message: messageContentSchema,
    to: z.array(z.string()).min(1),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ChatCreateParams>;

export const chatCreateAgentParamsSchema = agentParamsWithoutFrom(
  chatCreateParamsSchema,
);

export type ChatCreateParams = z.infer<typeof chatCreateParamsSchema>;
export type ChatCreateAgentParams = z.infer<typeof chatCreateAgentParamsSchema>;
