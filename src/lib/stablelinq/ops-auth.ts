import { toCanonicalWalletAddress } from "@/lib/wallet";

const DEFAULT_OPS_WALLET =
  "0x2b38a4bb7ce552e82d5664224bacc1c3daf1ab7d" as const;

export class OpsWalletForbiddenError extends Error {
  status = 403;
  constructor() {
    super("Ops wallet required for line configuration");
    this.name = "OpsWalletForbiddenError";
  }
}

export function resolveOpsWallet(): string {
  const raw = process.env.STABLELINQ_OPS_WALLET ?? DEFAULT_OPS_WALLET;
  return toCanonicalWalletAddress(raw);
}

export function assertOpsWallet(wallet: string | null | undefined): void {
  if (!wallet) {
    throw Object.assign(new Error("Wallet required"), { status: 401 });
  }
  if (toCanonicalWalletAddress(wallet) !== resolveOpsWallet()) {
    throw new OpsWalletForbiddenError();
  }
}
