import { NextResponse } from "next/server";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";
import { retrievePaymentRequest } from "@/lib/linq/rest";

export async function handlePaymentRequestsRetrieve(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request } = ctx;
  const paymentRequestId = pathParamFromRequest(request, "paymentRequestId");
  try {
    const result = await retrievePaymentRequest(paymentRequestId);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
