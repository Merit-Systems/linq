import type { MessagePart } from "@/lib/schemas/linq/message-parts";
import { linq } from "@/lib/linq/client";
import { isPairWarm } from "@/lib/message-slots/repository";
import { ASSIGNED_FROM_LINE } from "./constants";
import { pathParamFromRequest } from "./path-params";

const URL_IN_TEXT =
  /(?:https?:\/\/|www\.)[^\s]+|\b[a-z0-9][-a-z0-9]*\.(com|org|net|io|dev|app|co|me|xyz|ai|us|uk)\b/i;

const COLD_PAIR_MESSAGE =
  "First message to this recipient must be text-only (no links, media, or URLs). Send a plain text opener, then follow up.";

export function textContainsUrl(text: string): boolean {
  return URL_IN_TEXT.test(text);
}

export function assertColdOutboundContentAllowed(parts: MessagePart[]): void {
  for (const part of parts) {
    if (
      part.type === "link" ||
      part.type === "media" ||
      part.type === "imessage_app"
    ) {
      throw Object.assign(new Error(COLD_PAIR_MESSAGE), { status: 422 });
    }
    if (part.type === "text" && textContainsUrl(part.value)) {
      throw Object.assign(new Error(COLD_PAIR_MESSAGE), { status: 422 });
    }
  }
}

export interface ClassifiedRecipients {
  from: typeof ASSIGNED_FROM_LINE;
  cold: string[];
  warm: string[];
}

export async function classifyRecipients(
  slug: string,
  body: Record<string, unknown>,
): Promise<ClassifiedRecipients> {
  const from = ASSIGNED_FROM_LINE;

  if (slug === "chats/messages/send" || slug === "chats/send-voicememo") {
    return { from, cold: [], warm: [] };
  }

  if (slug === "chats/create" || slug === "messages/create") {
    const to = body.to as string[] | undefined;
    if (!to?.length) return { from, cold: [], warm: [] };

    const cold: string[] = [];
    const warm: string[] = [];
    for (const recipient of to) {
      if (await isPairWarm(from, recipient)) {
        warm.push(recipient);
      } else {
        cold.push(recipient);
      }
    }
    return { from, cold, warm };
  }

  return { from, cold: [], warm: [] };
}

export async function validateColdOutbound(
  slug: string,
  ctx: { body?: unknown; request?: Request },
): Promise<void> {
  const body = (ctx.body ?? {}) as Record<string, unknown>;

  if (slug === "chats/create") {
    const message = body.message as { parts?: MessagePart[] } | undefined;
    if (message?.parts) assertColdOutboundContentAllowed(message.parts);
    return;
  }

  if (slug === "messages/create") {
    const to = body.to as string[] | undefined;
    const message = body.message as { parts?: MessagePart[] } | undefined;
    if (!to?.length || !message?.parts) return;

    const { cold } = await classifyRecipients(slug, body);
    if (cold.length > 0) assertColdOutboundContentAllowed(message.parts);
    return;
  }

  if (slug === "chats/send-voicememo") {
    const request = ctx.request;
    if (!request) return;
    const chatId = pathParamFromRequest(request, "chatId");
    const chat = await linq.chats.retrieve(chatId);
    const recipients = chat.handles
      .filter((h) => !h.is_me)
      .map((h) => h.handle);
    for (const to of recipients) {
      if (!(await isPairWarm(ASSIGNED_FROM_LINE, to))) {
        throw Object.assign(new Error(COLD_PAIR_MESSAGE), { status: 422 });
      }
    }
  }
}
