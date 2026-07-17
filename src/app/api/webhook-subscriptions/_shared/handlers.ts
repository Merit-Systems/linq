import { NextResponse } from "next/server";
import { assertOpsWallet } from "@/lib/stablelinq/ops-auth";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";

export async function handleWebhookSubscriptionsCreate(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { body, wallet } = ctx;
  assertOpsWallet(wallet);
  try {
    const result = await linq.webhookSubscriptions.create(body as never);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
