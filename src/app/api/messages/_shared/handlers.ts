import { NextResponse } from "next/server";
import { injectFromLine } from "@/lib/routing/_shared/from-line";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { recordSentMessage } from "@/lib/stablelinq/sent-messages/repository";
import { reserveMessageSendSlots, markColdRecipientsWarm } from "@/lib/routing/_shared/message-pricing";

export async function handleMessagesCreate(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { body, wallet } = ctx;
  const { classified, priceUsd } = await reserveMessageSendSlots("messages/create", body, wallet ?? null);
  try {
    const result = await linq.messages.create(injectFromLine(body as Record<string, unknown>) as never);
    await markColdRecipientsWarm(classified.cold);
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
