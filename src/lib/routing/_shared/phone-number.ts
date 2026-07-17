/** Canonical E.164 phone line or recipient (preserve case; do not lowercasing). */
export function canonicalPhoneNumber(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("+")) {
    throw Object.assign(new Error(`Phone number must be E.164: ${raw}`), {
      status: 400,
    });
  }
  return trimmed;
}
