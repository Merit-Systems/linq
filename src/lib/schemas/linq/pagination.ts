import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const paginationCursorSchema = z.string().optional();

export const paginationLimitSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(100)
  .optional();

export const listChatsPaginationParamsSchema = z
  .object({
    cursor: paginationCursorSchema,
    limit: paginationLimitSchema,
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ListChatsPaginationParams>;

export const listMessagesPaginationParamsSchema = z
  .object({
    cursor: paginationCursorSchema,
    limit: paginationLimitSchema,
  })
  .strict() satisfies z.ZodType<LinqAPIV3.ListMessagesPaginationParams>;

export const listChatsPaginationResponseSchema = z.object({
  chats: z.array(z.unknown()),
  next_cursor: z.string(),
});

export const listMessagesPaginationResponseSchema = z.object({
  messages: z.array(z.unknown()),
  next_cursor: z.string(),
});

export type ListChatsPaginationParams = z.infer<
  typeof listChatsPaginationParamsSchema
>;
export type ListMessagesPaginationParams = z.infer<
  typeof listMessagesPaginationParamsSchema
>;
