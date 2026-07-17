/** Minimal wallet canonicalization (standalone — no monorepo package). */

export function toCanonicalWalletAddress(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("0x")) {
    return trimmed.toLowerCase();
  }
  return trimmed;
}
