import { prisma } from "@/lib/prisma";
import { canonicalPhoneNumber } from "@/lib/routing/_shared/phone-number";
import {
  dailyCounterKey,
  redis,
  secondsUntilMidnightUtc,
} from "./kv";

export async function peekDailyMessageSlot(): Promise<{
  slotNumber: number;
  retryAfter: number;
}> {
  const count = (await redis.get<number>(dailyCounterKey())) ?? 0;
  return {
    slotNumber: count + 1,
    retryAfter: secondsUntilMidnightUtc(),
  };
}

export async function reserveDailyMessageSlot(): Promise<{
  slotNumber: number;
  retryAfter?: number;
}> {
  const key = dailyCounterKey();
  const slotNumber = await redis.incr(key);
  if (slotNumber === 1) {
    await redis.expire(key, secondsUntilMidnightUtc());
  }

  const retryAfter = secondsUntilMidnightUtc();
  if (slotNumber > 6000) {
    return { slotNumber, retryAfter };
  }
  return { slotNumber };
}

export async function isPairWarm(from: string, to: string): Promise<boolean> {
  const fromLine = canonicalPhoneNumber(from);
  const recipient = canonicalPhoneNumber(to);
  const row = await prisma.recipientWarmth.findUnique({
    where: {
      fromLine_recipient: { fromLine, recipient },
    },
    select: { id: true },
  });
  return row !== null;
}

export async function markPairWarm(
  from: string,
  to: string,
  chatId?: string,
): Promise<void> {
  const fromLine = canonicalPhoneNumber(from);
  const recipient = canonicalPhoneNumber(to);
  await prisma.recipientWarmth.upsert({
    where: { fromLine_recipient: { fromLine, recipient } },
    create: {
      fromLine,
      recipient,
      ...(chatId ? { chatId } : {}),
    },
    update: {
      ...(chatId ? { chatId } : {}),
    },
  });
}

export async function markPairWarmMulti(
  from: string,
  recipients: string[],
  chatId?: string,
): Promise<void> {
  await Promise.all(
    recipients.map((to) => markPairWarm(from, to, chatId)),
  );
}
