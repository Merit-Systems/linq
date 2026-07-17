import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { listMessagesPaginationParamsSchema } from "../pagination";
import { messageThreadOrderSchema } from "../enums";

export const messageListMessagesThreadParamsSchema =
  listMessagesPaginationParamsSchema
    .extend({
      order: messageThreadOrderSchema.optional(),
    })
    .strict() satisfies z.ZodType<LinqAPIV3.MessageListMessagesThreadParams>;

export type MessageListMessagesThreadParams = z.infer<
  typeof messageListMessagesThreadParamsSchema
>;
