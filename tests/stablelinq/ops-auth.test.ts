import { describe, expect, it } from "vitest";

describe("ops-auth", () => {
  it("assertOpsWallet allows configured ops wallet", async () => {
    const { assertOpsWallet, resolveOpsWallet } = await import(
      "@/lib/stablelinq/ops-auth"
    );
    expect(() => assertOpsWallet(resolveOpsWallet())).not.toThrow();
  });

  it("assertOpsWallet rejects other wallets", async () => {
    const { assertOpsWallet, OpsWalletForbiddenError } = await import(
      "@/lib/stablelinq/ops-auth"
    );
    expect(() => assertOpsWallet("0x0000000000000000000000000000000000000001")).toThrow(
      OpsWalletForbiddenError,
    );
  });

  it("assertOpsWallet requires wallet", async () => {
    const { assertOpsWallet } = await import("@/lib/stablelinq/ops-auth");
    expect(() => assertOpsWallet(null)).toThrow(/Wallet required/);
  });
});
