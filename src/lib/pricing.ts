import { env } from "@/env";

export const LINQ_PACKAGE_USD = env.STABLELINQ_LINQ_PACKAGE_USD;
export const LINQ_PACKAGE_MESSAGES = env.STABLELINQ_LINQ_PACKAGE_MESSAGES;
export const LINQ_COST_PER_MESSAGE =
  LINQ_PACKAGE_USD / LINQ_PACKAGE_MESSAGES;

export const MAX_DAILY_MESSAGES = env.STABLELINQ_DAILY_MESSAGE_CAP;
export const BASE_PRICE_USD = env.STABLELINQ_BASE_PRICE_USD;
export const FLAT_PRICE_USD = env.STABLELINQ_FLAT_PRICE_USD;

export const FLAT_PRICE_USD_STRING = (
  Number.isFinite(FLAT_PRICE_USD) ? FLAT_PRICE_USD : 0.02
).toFixed(2);

const MESSAGE_TIER_MULTIPLIERS: [number, number][] = [
  [2000, 1.0],
  [3600, 1.25],
  [4800, 1.75],
  [5400, 2.5],
  [5700, 5.0],
  [5940, 10.0],
  [5999, 25.0],
];

export function getMultiplier(slotNumber: number): number {
  for (const [maxSlot, mult] of MESSAGE_TIER_MULTIPLIERS) {
    if (slotNumber <= maxSlot) return mult;
  }
  return 25.0;
}

export function getMessagePriceUsd(slotNumber: number): string | null {
  if (slotNumber > MAX_DAILY_MESSAGES) return null;
  return (BASE_PRICE_USD * getMultiplier(slotNumber)).toFixed(2);
}

export function maxMessagePrice(): string {
  const base = Number.isFinite(BASE_PRICE_USD) ? BASE_PRICE_USD : 0.05;
  return (base * 25).toFixed(2);
}

export function flatPriceUsd(): string {
  return FLAT_PRICE_USD_STRING;
}

export function secondsUntilMidnightUtc(): number {
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.ceil((midnight.getTime() - Date.now()) / 1000);
}
