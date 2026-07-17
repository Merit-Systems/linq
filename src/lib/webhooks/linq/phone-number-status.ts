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

export function formatChangedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export function phoneStatusAlertHeading(changes: PhoneStatusChanges): string {
  const { data } = changes;
  const degraded =
    data.new_status === "FLAGGED" ||
    data.new_reputation === "CRITICAL" ||
    data.new_reputation === "AT_RISK";
  return degraded ? "StableLinq line alert" : "StableLinq line recovered";
}

export function buildPhoneStatusDiscordEmbed(changes: PhoneStatusChanges) {
  const { data, statusChanged, reputationChanged } = changes;
  const lines = [
    `**${data.phone_number}** · ${formatChangedAt(data.changed_at)}`,
  ];

  const deltas: string[] = [];
  if (statusChanged) {
    deltas.push(`Status **${data.previous_status} → ${data.new_status}**`);
  }
  if (reputationChanged) {
    deltas.push(
      `Reputation **${data.previous_reputation} → ${data.new_reputation}**`,
    );
  }
  if (deltas.length > 0) {
    lines.push(deltas.join(" · "));
  }

  return {
    color: severityColor(changes),
    description: lines.join("\n"),
  };
}
