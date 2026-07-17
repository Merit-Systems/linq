import { NextResponse } from "next/server";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";
import { reserveFollowUpMessageSlot } from "@/lib/routing/_shared/message-pricing";
import { validateColdOutbound } from "@/lib/routing/_shared/first-message-validate";

export async function handleChatsSendVoicememo(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, body, wallet } = ctx;
  const chatId = pathParamFromRequest(request, "chatId");
  await validateColdOutbound("chats/send-voicememo", { body, request });
  await reserveFollowUpMessageSlot(wallet ?? null, "chats/send-voicememo");
  try {
    const result = await linq.chats.sendVoicememo(chatId, body as never);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
