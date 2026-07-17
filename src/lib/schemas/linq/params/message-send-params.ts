import type { MessageSendParams } from "@linqapp/sdk/resources/chats/messages";
import { z } from "zod";
import { messageContentSchema } from "../message-content";

export const messageSendParamsSchema = z
  .object({
    message: messageContentSchema,
  })
  .strict() satisfies z.ZodType<MessageSendParams>;

export type MessageSendParamsInput = z.infer<typeof messageSendParamsSchema>;
