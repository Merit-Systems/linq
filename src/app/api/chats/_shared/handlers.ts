import { NextResponse } from "next/server";
import { injectFromLine } from "@/lib/routing/_shared/from-line";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { reserveMessageSendSlots, markColdRecipientsWarm } from "@/lib/routing/_shared/message-pricing";

export async function handleChatsCreate(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, body, wallet } = ctx;
  const { classified } = await reserveMessageSendSlots("chats/create", body, request, wallet ?? null);
  try {
    const result = await linq.chats.create(injectFromLine(body as Record<string, unknown>) as never);
    await markColdRecipientsWarm(classified.cold, (result as { chat?: { id?: string } }).chat?.id);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}

export async function handleChatsList(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { query } = ctx;
  try {
    const result = await linq.chats.listChats((query as Record<string, string | string[] | undefined> | undefined) ?? undefined);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
