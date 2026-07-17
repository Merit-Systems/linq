import { z } from "zod";

export const phoneLineStatusSchema = z.enum(["ACTIVE", "FLAGGED"]);
export const phoneReputationSchema = z.enum(["HEALTHY", "AT_RISK", "CRITICAL"]);

export const phoneNumberStatusUpdatedDataSchema = z.object({
  phone_number: z.string(),
  previous_status: phoneLineStatusSchema,
  new_status: phoneLineStatusSchema,
  previous_reputation: phoneReputationSchema,
  new_reputation: phoneReputationSchema,
  changed_at: z.string(),
});

export type PhoneNumberStatusUpdatedData = z.infer<
  typeof phoneNumberStatusUpdatedDataSchema
>;

export interface PhoneStatusChanges {
  statusChanged: boolean;
  reputationChanged: boolean;
  data: PhoneNumberStatusUpdatedData;
}

export function extractPhoneStatusChanges(
  data: PhoneNumberStatusUpdatedData,
): PhoneStatusChanges | null {
  const statusChanged = data.previous_status !== data.new_status;
  const reputationChanged = data.previous_reputation !== data.new_reputation;
  if (!statusChanged && !reputationChanged) return null;
  return { statusChanged, reputationChanged, data };
}

export function severityColor(changes: PhoneStatusChanges): number {
  const { data } = changes;
  if (data.new_status === "FLAGGED" || data.new_reputation === "CRITICAL") {
    return 0xed_42_43;
  }
  if (data.new_reputation === "AT_RISK") {
    return 0xfa_a6_1a;
  }
  return 0x57_f2_87;
}

export function buildPhoneStatusDiscordEmbed(changes: PhoneStatusChanges) {
  const { data, statusChanged, reputationChanged } = changes;
  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    { name: "Line", value: data.phone_number, inline: true },
    { name: "Changed at", value: data.changed_at, inline: true },
  ];

  if (statusChanged) {
    fields.push({
      name: "Status",
      value: `${data.previous_status} → ${data.new_status}`,
      inline: false,
    });
  }

  if (reputationChanged) {
    fields.push({
      name: "Reputation",
      value: `${data.previous_reputation} → ${data.new_reputation}`,
      inline: false,
    });
  }

  const degraded =
    data.new_status === "FLAGGED" ||
    data.new_reputation === "CRITICAL" ||
    data.new_reputation === "AT_RISK";

  return {
    title: degraded
      ? "StableLinq line alert"
      : "StableLinq line recovered",
    color: severityColor(changes),
    fields,
    footer: { text: "Linq phone_number.status_updated" },
  };
}
