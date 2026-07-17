import { NextResponse } from "next/server";
import { assertOpsWallet } from "@/lib/stablelinq/ops-auth";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";

export async function handleWebhookSubscriptionsUpdate(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, body, wallet } = ctx;
  const subscriptionId = pathParamFromRequest(request, "subscriptionId");
  assertOpsWallet(wallet);
  try {
    const result = await linq.webhookSubscriptions.update(subscriptionId, body as never);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}

export async function handleWebhookSubscriptionsDelete(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, wallet } = ctx;
  const subscriptionId = pathParamFromRequest(request, "subscriptionId");
  assertOpsWallet(wallet);
  try {
    const result = await linq.webhookSubscriptions.delete(subscriptionId);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
