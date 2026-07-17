import { ASSIGNED_FROM_LINE } from "@/lib/routing/_shared/constants";
import { postDiscordPhoneStatusAlert } from "@/lib/notifications/discord";
import { resetUnansweredOutbound } from "@/lib/message-slots/repository";
import { linq } from "@/lib/linq/client";
import { redis, webhookEventKey } from "@/lib/message-slots/kv";
import {
  phoneNumberStatusUpdatedDataSchema,
} from "@/lib/webhooks/linq/phone-number-status";
import {
  extractInboundRecipient,
  messageReceivedDataSchema,
} from "@/lib/webhooks/linq/message-received";

const WEBHOOK_DEDUPE_TTL_SECONDS = 7 * 24 * 60 * 60;

async function markEventSeen(eventId: string): Promise<boolean> {
  const dedupeKey = webhookEventKey(eventId);
  const seen = await redis.get<string>(dedupeKey);
  if (seen) {
    return true;
  }
  return false;
}

async function rememberEvent(eventId: string): Promise<void> {
  const dedupeKey = webhookEventKey(eventId);
  await redis.set(dedupeKey, "1", { ex: WEBHOOK_DEDUPE_TTL_SECONDS });
}

async function handlePhoneNumberStatusUpdated(
  event: { event_id: string; data: unknown },
): Promise<Response> {
  const parsed = phoneNumberStatusUpdatedDataSchema.safeParse(event.data);
  if (!parsed.success) {
    console.error("[webhooks/linq] invalid payload:", parsed.error.flatten());
    return Response.json({ ok: false, error: "invalid payload" }, { status: 422 });
  }

  if (parsed.data.phone_number !== ASSIGNED_FROM_LINE) {
    await rememberEvent(event.event_id);
    return Response.json({ ok: true, ignored: "other_line" });
  }

  try {
    const notified = await postDiscordPhoneStatusAlert(parsed.data);
    await rememberEvent(event.event_id);
    return Response.json({ ok: true, notified });
  } catch (err) {
    console.error("[webhooks/linq] discord notify failed:", err);
    return Response.json({ ok: false, error: "discord failed" }, { status: 500 });
  }
}

async function handleMessageReceived(
  event: { event_id: string; data: unknown },
): Promise<Response> {
  const parsed = messageReceivedDataSchema.safeParse(event.data);
  if (!parsed.success) {
    console.error("[webhooks/linq] invalid message.received payload:", parsed.error.flatten());
    return Response.json({ ok: false, error: "invalid payload" }, { status: 422 });
  }

  const inbound = extractInboundRecipient(parsed.data);
  if (!inbound) {
    return Response.json({ ok: true, ignored: "outbound_or_unknown" });
  }

  await resetUnansweredOutbound(
    ASSIGNED_FROM_LINE,
    inbound.recipient,
    inbound.chatId ?? undefined,
  );

  await rememberEvent(event.event_id);
  return Response.json({ ok: true, reset: inbound.recipient });
}

export async function handleLinqWebhook(
  rawBody: string,
  headers: Record<string, string>,
): Promise<Response> {
  let event: { event_type: string; event_id: string; data: unknown };

  try {
    event = linq.webhooks.unwrap(rawBody, { headers }) as typeof event;
  } catch (err) {
    console.error("[webhooks/linq] verification failed:", err);
    return new Response("Invalid webhook signature", { status: 401 });
  }

  if (
    event.event_type !== "phone_number.status_updated" &&
    event.event_type !== "message.received"
  ) {
    return Response.json({ ok: true, ignored: true });
  }

  if (await markEventSeen(event.event_id)) {
    return Response.json({ ok: true, duplicate: true });
  }

  if (event.event_type === "phone_number.status_updated") {
    return handlePhoneNumberStatusUpdated(event);
  }

  return handleMessageReceived(event);
}
