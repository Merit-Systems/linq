import { NextResponse } from "next/server";
import type { AccountChatsListParams } from "@/lib/schemas/stablelinq/account-chats";
import { listChatsForWallet } from "@/lib/stablelinq/sent-messages/repository";

export async function handleAccountChatsList(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { wallet, query } = ctx;
  if (!wallet) throw Object.assign(new Error("Wallet required"), { status: 401 });
  const q = query as AccountChatsListParams;
  const result = await listChatsForWallet({
    walletAddress: wallet,
    cursor: q.cursor,
    limit: q.limit,
  });
  return NextResponse.json(result);
}
