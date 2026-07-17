import { NextResponse } from "next/server";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";

export async function handleChatsParticipantsAdd(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, body } = ctx;
  const chatId = pathParamFromRequest(request, "chatId");
  try {
    const result = await linq.chats.participants.add(chatId, body as never);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}

export async function handleChatsParticipantsRemove(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, body } = ctx;
  const chatId = pathParamFromRequest(request, "chatId");
  try {
    const result = await linq.chats.participants.remove(chatId, body as never);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
