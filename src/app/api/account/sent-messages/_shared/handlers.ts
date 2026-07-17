import { NextResponse } from "next/server";
import type { SentMessagesListParams } from "@/lib/schemas/stablelinq/sent-messages";
import { listSentMessagesForWallet } from "@/lib/stablelinq/sent-messages/repository";

export async function handleAccountSentMessagesList(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { wallet, query } = ctx;
  if (!wallet) throw Object.assign(new Error("Wallet required"), { status: 401 });
  const q = query as SentMessagesListParams;
  const result = await listSentMessagesForWallet({
    walletAddress: wallet,
    cursor: q.cursor,
    limit: q.limit,
    chatId: q.chatId,
  });
  return NextResponse.json(result);
}
