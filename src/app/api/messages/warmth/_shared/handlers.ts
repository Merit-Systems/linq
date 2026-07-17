import { NextResponse } from "next/server";
import { lookupRecipientWarmth } from "@/lib/message-slots/repository";
import { ASSIGNED_FROM_LINE } from "@/lib/routing/_shared/constants";
import { canonicalPhoneNumber } from "@/lib/routing/_shared/phone-number";
import {
  reconcileUnansweredOutbound,
  shouldReconcileUnansweredOutbound,
} from "@/lib/routing/_shared/unanswered-outbound-reconcile";
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

  const results = await Promise.all(
    to.map(async (recipient) => {
      const canonical = canonicalPhoneNumber(recipient);
      const warm = warmByRecipient.get(canonical);
      if (warm) {
        let consecutiveUnansweredOutbound = warm.consecutiveUnansweredOutbound;
        if (
          warm.chatId &&
          shouldReconcileUnansweredOutbound(consecutiveUnansweredOutbound)
        ) {
          consecutiveUnansweredOutbound = await reconcileUnansweredOutbound({
            recipient: canonical,
            chatId: warm.chatId,
            postgresCount: consecutiveUnansweredOutbound,
          });
        }

        return {
          recipient: canonical,
          warmth: "warm" as const,
          chat_id: warm.chatId,
          consecutive_unanswered_outbound: consecutiveUnansweredOutbound,
          send_blocked: isSendBlocked(consecutiveUnansweredOutbound),
        };
      }
      return {
        recipient: canonical,
        warmth: "cold" as const,
        chat_id: null,
        consecutive_unanswered_outbound: 0,
        send_blocked: false,
      };
    }),
  );

  return NextResponse.json({
    from_line: ASSIGNED_FROM_LINE,
    results,
  });
}
