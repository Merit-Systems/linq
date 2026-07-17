import { describe, expect, it } from "vitest";
import {
  buildPhoneStatusDiscordEmbed,
  extractPhoneStatusChanges,
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

  it("builds embed with changed fields only", () => {
    const changes = extractPhoneStatusChanges({
      ...base,
      previous_status: "ACTIVE",
      new_status: "FLAGGED",
      previous_reputation: "HEALTHY",
      new_reputation: "CRITICAL",
    });
    expect(changes).not.toBeNull();
    const embed = buildPhoneStatusDiscordEmbed(changes!);
    expect(embed.title).toContain("alert");
    expect(embed.color).toBe(0xed_42_43);
    const names = embed.fields.map((f) => f.name);
    expect(names).toContain("Status");
    expect(names).toContain("Reputation");
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
