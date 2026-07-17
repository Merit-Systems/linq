import { NextResponse } from "next/server";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";

export async function handleCapabilityCheckImessage(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { body } = ctx;
  try {
    const result = await linq.capability.checkIMessage(body as never);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
