import { describe, expect, it } from "vitest";
import {
  buildPhoneStatusDiscordEmbed,
  extractPhoneStatusChanges,
  phoneStatusAlertHeading,
} from "@/lib/webhooks/linq/phone-number-status";

describe("phone number status changes", () => {
  const base = {
    phone_number: "+12052438809",
    changed_at: "2026-02-18T18:35:05.000Z",
  };

  it("returns null when nothing changed", () => {
    expect(
      extractPhoneStatusChanges({
        ...base,
        previous_status: "ACTIVE",
        new_status: "ACTIVE",
        previous_reputation: "HEALTHY",
        new_reputation: "HEALTHY",
      }),
    ).toBeNull();
  });

  it("detects status change", () => {
    const changes = extractPhoneStatusChanges({
      ...base,
      previous_status: "ACTIVE",
      new_status: "FLAGGED",
      previous_reputation: "HEALTHY",
      new_reputation: "HEALTHY",
    });
    expect(changes?.statusChanged).toBe(true);
    expect(changes?.reputationChanged).toBe(false);
  });

  it("detects reputation change", () => {
    const changes = extractPhoneStatusChanges({
      ...base,
      previous_status: "ACTIVE",
      new_status: "ACTIVE",
      previous_reputation: "HEALTHY",
      new_reputation: "AT_RISK",
    });
    expect(changes?.statusChanged).toBe(false);
    expect(changes?.reputationChanged).toBe(true);
  });

  it("builds compact embed with formatted date and no footer", () => {
    const changes = extractPhoneStatusChanges({
      ...base,
      previous_status: "ACTIVE",
      new_status: "FLAGGED",
      previous_reputation: "HEALTHY",
      new_reputation: "CRITICAL",
    });
    expect(changes).not.toBeNull();
    expect(phoneStatusAlertHeading(changes!)).toBe("StableLinq line alert");
    const embed = buildPhoneStatusDiscordEmbed(changes!);
    expect(embed.color).toBe(0xed_42_43);
    expect(embed.description).toContain("+12052438809");
    expect(embed.description).toContain("Status **ACTIVE → FLAGGED**");
    expect(embed.description).toContain("Reputation **HEALTHY → CRITICAL**");
    expect(embed.description).toContain("Feb 18, 2026");
    expect(embed).not.toHaveProperty("title");
    expect(embed).not.toHaveProperty("footer");
    expect(embed).not.toHaveProperty("fields");
  });
});

describe("canonical phone number", () => {
  it("preserves E.164", async () => {
    const { canonicalPhoneNumber } = await import(
      "@/lib/routing/_shared/phone-number"
    );
    expect(canonicalPhoneNumber("+12052438809")).toBe("+12052438809");
  });
});
