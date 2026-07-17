import { NotFoundError } from "@linqapp/sdk";
import { NextResponse } from "next/server";
import { linq } from "@/lib/linq/client";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";
import type { AccountChatMessagesListParams } from "@/lib/schemas/stablelinq/chat-messages";
import {
  assertChatKnownOnLine,
  ChatNotFoundError,
} from "@/lib/stablelinq/chat-access";

export async function handleAccountChatMessagesList(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { wallet, request, query } = ctx;
  if (!wallet) throw Object.assign(new Error("Wallet required"), { status: 401 });

  const chatId = pathParamFromRequest(request, "chatId");
  const q = (query ?? {}) as AccountChatMessagesListParams;

  try {
    await assertChatKnownOnLine(chatId);
  } catch (err) {
    if (err instanceof ChatNotFoundError) {
      throw Object.assign(new Error(err.message), { status: 404 });
    }
    throw err;
  }

  try {
    const page = await linq.chats.messages.list(chatId, {
      cursor: q.cursor,
      limit: q.limit,
    });

    return NextResponse.json({
      messages: page.getPaginatedItems(),
      next_cursor: page.hasNextPage() ? page.next_cursor : null,
    });
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw Object.assign(new Error("Chat not found"), { status: 404 });
    }
    console.error("[account/chats/messages] Linq list failed:", err);
    throw Object.assign(new Error("Failed to load chat messages"), { status: 502 });
  }
}
