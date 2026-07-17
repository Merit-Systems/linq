import { NextResponse } from "next/server";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";
import { incrementUnansweredOutboundForChat } from "@/lib/routing/_shared/unanswered-outbound-increment";
import { recordSentMessage } from "@/lib/stablelinq/sent-messages/repository";
import { reserveFollowUpMessageSlot } from "@/lib/routing/_shared/message-pricing";

export async function handleChatsSendVoicememo(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, body, wallet } = ctx;
  const chatId = pathParamFromRequest(request, "chatId");
  const { priceUsd } = await reserveFollowUpMessageSlot(wallet ?? null, "chats/send-voicememo");
  try {
    const result = await linq.chats.sendVoicememo(chatId, body as never);
    await incrementUnansweredOutboundForChat(chatId);
    await recordSentMessage({
      wallet,
      slug: "chats/send-voicememo",
      body,
      result,
      priceUsd,
      chatId: chatId,
    });
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
