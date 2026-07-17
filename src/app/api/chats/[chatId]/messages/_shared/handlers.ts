import { NextResponse } from "next/server";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";
import { reserveFollowUpMessageSlot } from "@/lib/routing/_shared/message-pricing";

export async function handleChatsMessagesSend(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, body, wallet } = ctx;
  const chatId = pathParamFromRequest(request, "chatId");
  await reserveFollowUpMessageSlot(wallet ?? null, "chats/messages/send");
  try {
    const result = await linq.chats.messages.send(chatId, body as never);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}

export async function handleChatsMessagesList(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, query } = ctx;
  const chatId = pathParamFromRequest(request, "chatId");
  try {
    const result = await linq.chats.messages.list(chatId, (query as Record<string, string | string[] | undefined> | undefined) ?? undefined);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
