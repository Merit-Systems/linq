import { NextResponse } from "next/server";
import { injectFromLine } from "@/lib/routing/_shared/from-line";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { incrementUnansweredOutbound } from "@/lib/message-slots/repository";
import { recordSentMessage } from "@/lib/stablelinq/sent-messages/repository";
import {
  reserveMessageSendSlots,
  markColdRecipientsWarm,
} from "@/lib/routing/_shared/message-pricing";
import { ASSIGNED_FROM_LINE } from "@/lib/routing/_shared/constants";
import { canonicalPhoneNumber } from "@/lib/routing/_shared/phone-number";

export async function handleMessagesCreate(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { body, wallet } = ctx;
  const { classified, priceUsd } = await reserveMessageSendSlots(
    "messages/create",
    body,
    wallet ?? null,
  );
  try {
    const result = await linq.messages.create(
      injectFromLine(body as Record<string, unknown>) as never,
    );
    const createResult = result as { chat_id?: string };
    await markColdRecipientsWarm(classified.cold, createResult.chat_id);
    const recipients = [
      ...classified.cold.map((recipient) => canonicalPhoneNumber(recipient)),
      ...classified.warm.map((recipient) => canonicalPhoneNumber(recipient)),
    ];
    await Promise.all(
      recipients.map((recipient) =>
        incrementUnansweredOutbound(
          ASSIGNED_FROM_LINE,
          recipient,
          createResult.chat_id,
        ),
      ),
    );
    await recordSentMessage({
      wallet,
      slug: "messages/create",
      body,
      result,
      priceUsd,
      classified,
    });
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
