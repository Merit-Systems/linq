import { ASSIGNED_FROM_LINE } from "@/lib/routing/_shared/constants";
import { postDiscordPhoneStatusAlert } from "@/lib/notifications/discord";
import { linq } from "@/lib/linq/client";
import { redis, webhookEventKey } from "@/lib/message-slots/kv";
import {
  phoneNumberStatusUpdatedDataSchema,
} from "@/lib/webhooks/linq/phone-number-status";

const WEBHOOK_DEDUPE_TTL_SECONDS = 7 * 24 * 60 * 60;

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

  if (event.event_type !== "phone_number.status_updated") {
    return Response.json({ ok: true, ignored: true });
  }

  const dedupeKey = webhookEventKey(event.event_id);
  const seen = await redis.get<string>(dedupeKey);
  if (seen) {
    return Response.json({ ok: true, duplicate: true });
  }

  const parsed = phoneNumberStatusUpdatedDataSchema.safeParse(event.data);
  if (!parsed.success) {
    console.error("[webhooks/linq] invalid payload:", parsed.error.flatten());
    return Response.json({ ok: false, error: "invalid payload" }, { status: 422 });
  }

  if (parsed.data.phone_number !== ASSIGNED_FROM_LINE) {
    await redis.set(dedupeKey, "1", { ex: WEBHOOK_DEDUPE_TTL_SECONDS });
    return Response.json({ ok: true, ignored: "other_line" });
  }

  try {
    const notified = await postDiscordPhoneStatusAlert(parsed.data);
    await redis.set(dedupeKey, "1", { ex: WEBHOOK_DEDUPE_TTL_SECONDS });
    return Response.json({ ok: true, notified });
  } catch (err) {
    console.error("[webhooks/linq] discord notify failed:", err);
    return Response.json({ ok: false, error: "discord failed" }, { status: 500 });
  }
}
