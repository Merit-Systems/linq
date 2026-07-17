import { NextResponse } from "next/server";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";

export async function handleWebhookSubscriptionsRetrieve(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request } = ctx;
  const subscriptionId = pathParamFromRequest(request, "subscriptionId");
  try {
    const result = await linq.webhookSubscriptions.retrieve(subscriptionId);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}

export async function handleWebhookSubscriptionsUpdate(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, body } = ctx;
  const subscriptionId = pathParamFromRequest(request, "subscriptionId");
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
  const { request } = ctx;
  const subscriptionId = pathParamFromRequest(request, "subscriptionId");
  try {
    const result = await linq.webhookSubscriptions.delete(subscriptionId);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
