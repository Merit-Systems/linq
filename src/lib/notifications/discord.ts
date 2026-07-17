import {
  buildPhoneStatusDiscordEmbed,
  extractPhoneStatusChanges,
  type PhoneNumberStatusUpdatedData,
} from "@/lib/webhooks/linq/phone-number-status";

export async function postDiscordWebhook(payload: {
  content?: string;
  embeds?: unknown[];
}): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    console.warn("[discord] DISCORD_WEBHOOK_URL not set — skipping notification");
    return;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Discord webhook failed (${res.status}): ${text}`);
  }
}

export async function postDiscordPhoneStatusAlert(
  data: PhoneNumberStatusUpdatedData,
): Promise<boolean> {
  const changes = extractPhoneStatusChanges(data);
  if (!changes) return false;

  await postDiscordWebhook({
    embeds: [buildPhoneStatusDiscordEmbed(changes)],
  });
  return true;
}
