import { NextResponse } from "next/server";
import { assertOpsWallet } from "@/lib/stablelinq/ops-auth";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";

export async function handleAvailableNumberRetrieve(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { query, wallet } = ctx;
  assertOpsWallet(wallet);
  try {
    const result = await linq.availableNumber.retrieve((query as Record<string, string | string[] | undefined> | undefined) ?? undefined);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
