import { NextResponse } from "next/server";
import { createPaymentRequest } from "@/lib/linq/rest";
import { listPaymentRequests } from "@/lib/linq/rest";
import { mapLinqError } from "@/lib/linq/errors";

export async function handlePaymentRequestsCreate(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { body } = ctx;
  try {
    const result = await createPaymentRequest(body as never);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}

export async function handlePaymentRequestsList(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { query } = ctx;
  try {
    const result = await listPaymentRequests((query as Record<string, string | string[] | undefined> | undefined) ?? undefined);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
