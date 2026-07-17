import { NextResponse } from "next/server";
import { assertWalletOwnsMessage } from "@/lib/stablelinq/sent-messages/repository";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";

export async function handleMessagesAddReaction(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, body, wallet } = ctx;
  const messageId = pathParamFromRequest(request, "messageId");
  if (!wallet) throw Object.assign(new Error("Wallet required"), { status: 401 });
  await assertWalletOwnsMessage({ walletAddress: wallet, linqMessageId: messageId });
  try {
    const result = await linq.messages.addReaction(messageId, body as never);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
