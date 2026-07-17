import { NextResponse } from "next/server";
import { cancelPaymentRequest } from "@/lib/linq/rest";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";

export async function handlePaymentRequestsCancel(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request } = ctx;
  const paymentRequestId = pathParamFromRequest(request, "paymentRequestId");
  try {
    const result = await cancelPaymentRequest(paymentRequestId);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
