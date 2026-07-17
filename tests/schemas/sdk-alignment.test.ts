import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");

describe("SDK schema alignment", () => {
  it("has linq schema index", () => {
    expect(
      existsSync(join(ROOT, "src/lib/schemas/linq/index.ts")),
    ).toBe(true);
  });

  it("routes.registry imports app api routes", () => {
    const registry = readFileSync(
      join(ROOT, "src/lib/routes.registry.ts"),
      "utf8",
    );
    expect(registry).toContain('import "@/app/api/chats/route"');
    expect(registry).toContain('import "@/app/api/messages/route"');
    expect(registry).toContain('import "@/app/api/payment-requests/route"');
  });

  it("message content schema includes part types", () => {
    const parts = readFileSync(
      join(ROOT, "src/lib/schemas/linq/message-parts.ts"),
      "utf8",
    );
    expect(parts).toContain('z.literal("text")');
    expect(parts).toContain('z.literal("media")');
    expect(parts).toContain('z.literal("link")');
  });
});

describe("first-message validation", () => {
  it("rejects links in cold content", async () => {
    const { assertColdOutboundContentAllowed } = await import(
      "@/lib/routing/_shared/first-message-validate"
    );
    expect(() =>
      assertColdOutboundContentAllowed([
        { type: "link", value: "https://example.com" },
      ]),
    ).toThrow();
  });

  it("allows plain text", async () => {
    const { assertColdOutboundContentAllowed } = await import(
      "@/lib/routing/_shared/first-message-validate"
    );
    expect(() =>
      assertColdOutboundContentAllowed([
        { type: "text", value: "Hello there" },
      ]),
    ).not.toThrow();
  });
});

describe("pricing", () => {
  it("computes tier multipliers", async () => {
    const { getMessagePriceUsd, getMultiplier } = await import(
      "@/lib/pricing"
    );
    expect(getMultiplier(100)).toBe(1);
    expect(getMultiplier(2000)).toBe(1);
    expect(getMultiplier(2001)).toBe(1.25);
    expect(getMessagePriceUsd(1)).toBe("0.05");
    expect(getMessagePriceUsd(6000)).toBe("1.25");
    expect(getMessagePriceUsd(6001)).toBeNull();
  });
});
