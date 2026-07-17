import { NextResponse } from "next/server";
import { linq } from "@/lib/linq/client";
import { mapLinqError } from "@/lib/linq/errors";
import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";

export async function handleAttachmentsRetrieve(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request } = ctx;
  const attachmentId = pathParamFromRequest(request, "attachmentId");
  try {
    const result = await linq.attachments.retrieve(attachmentId);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}

export async function handleAttachmentsDelete(ctx: {
  request: Request;
  body?: unknown;
  query?: unknown;
  wallet?: string | null;
}) {
  const { request } = ctx;
  const attachmentId = pathParamFromRequest(request, "attachmentId");
  try {
    const result = await linq.attachments.delete(attachmentId);
    return NextResponse.json(result ?? {});
  } catch (err) {
    throw mapLinqError(err);
  }
}
