import { NextResponse } from "next/server";
import { assertOpsWallet } from "@/lib/stablelinq/ops-auth";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";

export async function handlePhoneNumbersUpdate(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, body, wallet } = ctx;
  const phoneNumberId = pathParamFromRequest(request, "phoneNumberId");
  assertOpsWallet(wallet);
  try {
    const result = await linq.phoneNumbers.update(phoneNumberId, body as never);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
