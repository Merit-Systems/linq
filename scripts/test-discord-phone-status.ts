import "dotenv/config";
import { ASSIGNED_FROM_LINE } from "../src/lib/routing/_shared/constants.js";
import { postDiscordPhoneStatusAlert } from "../src/lib/notifications/discord.js";
import type { PhoneNumberStatusUpdatedData } from "../src/lib/webhooks/linq/phone-number-status.js";

const fixtures: Array<{ label: string; data: PhoneNumberStatusUpdatedData }> = [
  {
    label: "degraded (FLAGGED + CRITICAL)",
    data: {
      phone_number: ASSIGNED_FROM_LINE,
      previous_status: "ACTIVE",
      new_status: "FLAGGED",
      previous_reputation: "HEALTHY",
      new_reputation: "CRITICAL",
      changed_at: new Date().toISOString(),
    },
  },
  {
    label: "recovered (ACTIVE + HEALTHY)",
    data: {
      phone_number: ASSIGNED_FROM_LINE,
      previous_status: "FLAGGED",
      new_status: "ACTIVE",
      previous_reputation: "CRITICAL",
      new_reputation: "HEALTHY",
      changed_at: new Date().toISOString(),
    },
  },
];

async function main() {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.error("Set DISCORD_WEBHOOK_URL in .env.local");
    process.exit(1);
  }

  for (const { label, data } of fixtures) {
    console.log(`Posting: ${label}`);
    const sent = await postDiscordPhoneStatusAlert(data);
    console.log(`  notified=${sent}`);
  }

  console.log("Done — check Discord channel.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
