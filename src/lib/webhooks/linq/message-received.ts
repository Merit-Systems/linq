import { z } from "zod";

const chatHandleSchema = z.object({
  handle: z.string(),
  is_me: z.boolean().optional(),
});

export const messageReceivedDataSchema = z
  .object({
    direction: z.enum(["inbound", "outbound"]).optional(),
    is_from_me: z.boolean().optional(),
    chat: z.object({ id: z.string() }).optional(),
    chat_id: z.string().optional(),
    sender_handle: chatHandleSchema.optional(),
    from_handle: chatHandleSchema.optional(),
    from: z.string().optional(),
    message: z
      .object({
        is_from_me: z.boolean().optional(),
        chat_id: z.string().optional(),
        from: z.string().optional(),
        from_handle: chatHandleSchema.optional(),
      })
      .optional(),
  })
  .passthrough();

export type MessageReceivedData = z.infer<typeof messageReceivedDataSchema>;

export function extractInboundRecipient(
  data: MessageReceivedData,
): { recipient: string; chatId: string | null } | null {
  if (
    data.direction === "outbound" ||
    data.is_from_me === true ||
    data.message?.is_from_me === true
  ) {
    return null;
  }

  const recipient =
    data.sender_handle?.handle ??
    data.from_handle?.handle ??
    data.from ??
    data.message?.from_handle?.handle ??
    data.message?.from;

  if (!recipient) {
    return null;
  }

  const chatId =
    data.chat?.id ?? data.chat_id ?? data.message?.chat_id ?? null;

  return { recipient, chatId };
}
