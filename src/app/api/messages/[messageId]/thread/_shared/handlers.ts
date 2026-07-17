import { NextResponse } from "next/server";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";

export async function handleMessagesListThread(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request, query } = ctx;
  const messageId = pathParamFromRequest(request, "messageId");
  try {
    const result = await linq.messages.listMessagesThread(messageId, (query as Record<string, string | string[] | undefined> | undefined) ?? undefined);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
