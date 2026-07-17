import "dotenv/config";
import { ASSIGNED_FROM_LINE } from "../src/lib/routing/_shared/constants.js";
import { linq } from "../src/lib/linq/client.js";
import { env } from "../src/env.js";

const SUBSCRIBED_EVENTS = [
  "phone_number.status_updated",
  "message.received",
] as const;

const WEBHOOK_VERSION = "2026-02-03";

function targetUrl(): string {
  const base = env.BASE_URL.replace(/\/$/, "");
  return `${base}/api/webhooks/linq?version=${WEBHOOK_VERSION}`;
}

function hasAllEvents(events: string[] | undefined): boolean {
  return SUBSCRIBED_EVENTS.every((event) => (events ?? []).includes(event));
}

async function main() {
  const url = targetUrl();
  const existing = await linq.webhookSubscriptions.list();
  const subs = existing.subscriptions ?? [];

  const match = subs.find((subscription) => subscription.target_url === url);

  if (match && hasAllEvents(match.subscribed_events)) {
    console.log(`Webhook subscription already exists: ${match.id}`);
    console.log(`  target_url: ${match.target_url}`);
    console.log(`  events: ${match.subscribed_events?.join(", ")}`);
    return;
  }

  if (match) {
    const updated = await linq.webhookSubscriptions.update(match.id, {
      subscribed_events: [...SUBSCRIBED_EVENTS],
      target_url: url,
      phone_numbers: [ASSIGNED_FROM_LINE],
    });
    console.log("Updated webhook subscription:");
    console.log(`  id: ${updated.id}`);
    console.log(`  target_url: ${url}`);
    console.log(`  events: ${SUBSCRIBED_EVENTS.join(", ")}`);
    return;
  }

  const created = await linq.webhookSubscriptions.create({
    subscribed_events: [...SUBSCRIBED_EVENTS],
    target_url: url,
    phone_numbers: [ASSIGNED_FROM_LINE],
  });

  console.log("Created webhook subscription:");
  console.log(`  id: ${created.id}`);
  console.log(`  target_url: ${url}`);
  console.log(`  events: ${SUBSCRIBED_EVENTS.join(", ")}`);
  console.log(`  phone_numbers: ${ASSIGNED_FROM_LINE}`);
  console.log(`  signing_secret: ${created.signing_secret}`);
  console.log("");
  console.log(
    "Set LINQ_WEBHOOK_SECRET on Vercel (shown once — cannot be retrieved later):",
  );
  console.log(`  vercel env add LINQ_WEBHOOK_SECRET production preview`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
