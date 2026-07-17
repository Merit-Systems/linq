import { NextResponse } from "next/server";
import { lookupRecipientWarmth } from "@/lib/message-slots/repository";
import { ASSIGNED_FROM_LINE } from "@/lib/routing/_shared/constants";
import { canonicalPhoneNumber } from "@/lib/routing/_shared/phone-number";
import {
  isSendBlocked,
  type WarmthCheckParams,
} from "@/lib/schemas/stablelinq/warmth-check";

export async function handleMessagesWarmthCheck(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  if (!ctx.wallet) {
    throw Object.assign(new Error("Wallet required"), { status: 401 });
  }

  const { to } = ctx.body as WarmthCheckParams;
  const warmByRecipient = await lookupRecipientWarmth(to);

  const results = to.map((recipient) => {
    const canonical = canonicalPhoneNumber(recipient);
    const warm = warmByRecipient.get(canonical);
    if (warm) {
      return {
        recipient: canonical,
        warmth: "warm" as const,
        chat_id: warm.chatId,
        consecutive_unanswered_outbound: warm.consecutiveUnansweredOutbound,
        send_blocked: isSendBlocked(warm.consecutiveUnansweredOutbound),
      };
    }
    return {
      recipient: canonical,
      warmth: "cold" as const,
      chat_id: null,
      consecutive_unanswered_outbound: 0,
      send_blocked: false,
    };
  });

  return NextResponse.json({
    from_line: ASSIGNED_FROM_LINE,
    results,
  });
}
