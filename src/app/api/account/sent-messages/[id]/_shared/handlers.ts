import { NextResponse } from "next/server";
import {
  getSentMessageForWallet,
  SentMessageNotFoundError,
} from "@/lib/stablelinq/sent-messages/repository";

export async function handleAccountSentMessageRetrieve(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
  params?: Record<string, string>;
}) {
  const { wallet, params } = ctx;
  if (!wallet) throw Object.assign(new Error("Wallet required"), { status: 401 });
  const id = params?.id;
  if (!id) throw Object.assign(new Error("Missing path parameter: id"), { status: 400 });
  try {
    const result = await getSentMessageForWallet({
      walletAddress: wallet,
      id,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof SentMessageNotFoundError) {
      throw Object.assign(new Error(err.message), { status: 404 });
    }
    throw err;
  }
}
