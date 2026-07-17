import "dotenv/config";
import { ASSIGNED_FROM_LINE } from "../src/lib/routing/_shared/constants.js";
import { linq } from "../src/lib/linq/client.js";
import { env } from "../src/env.js";

const EVENT = "phone_number.status_updated" as const;

function targetUrl(): string {
  const base = env.BASE_URL.replace(/\/$/, "");
  return `${base}/api/webhooks/linq`;
}

async function main() {
  const url = targetUrl();
  const existing = await linq.webhookSubscriptions.list();
  const subs = existing.subscriptions ?? [];

  const match = subs.find(
    (s) =>
      s.target_url === url &&
      (s.subscribed_events ?? []).includes(EVENT),
  );

  if (match) {
    console.log(`Webhook subscription already exists: ${match.id}`);
    console.log(`  target_url: ${match.target_url}`);
    return;
  }

  const created = await linq.webhookSubscriptions.create({
    subscribed_events: [EVENT],
    target_url: url,
    phone_numbers: [ASSIGNED_FROM_LINE],
  });

  console.log("Created webhook subscription:");
  console.log(`  id: ${created.id}`);
  console.log(`  target_url: ${url}`);
  console.log(`  events: ${EVENT}`);
  console.log(`  phone_numbers: ${ASSIGNED_FROM_LINE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
