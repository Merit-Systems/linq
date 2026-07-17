import {
  DAILY_OUTBOUND_FIRST_CAP,
} from "@/lib/routing/_shared/constants";
import {
  outboundFirstKey,
  redis,
  secondsUntilMidnightUtc,
} from "./kv";

export async function peekOutboundFirstSlots(count: number): Promise<{
  available: boolean;
  slotNumber: number;
  retryAfter: number;
}> {
  const current = (await redis.get<number>(outboundFirstKey())) ?? 0;
  const slotNumber = current + count;
  const retryAfter = secondsUntilMidnightUtc();
  return {
    available: slotNumber <= DAILY_OUTBOUND_FIRST_CAP,
    slotNumber,
    retryAfter,
  };
}

export async function reserveOutboundFirstSlots(count: number): Promise<{
  slotNumber: number;
  retryAfter?: number;
}> {
  if (count <= 0) return { slotNumber: 0 };

  const key = outboundFirstKey();
  const slotNumber = await redis.incrby(key, count);
  if (slotNumber === count) {
    await redis.expire(key, secondsUntilMidnightUtc());
  }

  const retryAfter = secondsUntilMidnightUtc();
  if (slotNumber > DAILY_OUTBOUND_FIRST_CAP) {
    return { slotNumber, retryAfter };
  }
  return { slotNumber };
}
