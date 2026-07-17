import { NextResponse } from "next/server";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";

export async function handleChatsLocationRequest(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request } = ctx;
  const chatId = pathParamFromRequest(request, "chatId");
  try {
    const result = await linq.chats.location.request(chatId);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
