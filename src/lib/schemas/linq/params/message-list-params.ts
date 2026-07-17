import type { MessageListParams } from "@linqapp/sdk/resources/chats/messages";
import { z } from "zod";
import { listMessagesPaginationParamsSchema } from "../pagination";

export const messageListParamsSchema =
  listMessagesPaginationParamsSchema.strict() satisfies z.ZodType<MessageListParams>;

export type MessageListParamsInput = z.infer<typeof messageListParamsSchema>;
