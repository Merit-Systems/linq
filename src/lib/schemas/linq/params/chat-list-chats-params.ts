import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import {
  paginationCursorSchema,
  paginationLimitSchema,
} from "../pagination";

export const chatListChatsParamsSchema = z
  .object({
    cursor: paginationCursorSchema,
    limit: paginationLimitSchema,
    from: z.string().optional(),
    to: z.string().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ChatListChatsParams>;

export type ChatListChatsParams = z.infer<typeof chatListChatsParamsSchema>;
