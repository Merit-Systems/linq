import { prisma } from "@/lib/prisma";
import { ASSIGNED_FROM_LINE } from "@/lib/routing/_shared/constants";
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

export async function lookupRecipientWarmth(
  recipients: string[],
): Promise<
  Map<string, { chatId: string | null; consecutiveUnansweredOutbound: number }>
> {
  const fromLine = canonicalPhoneNumber(ASSIGNED_FROM_LINE);
  const canonicalRecipients = recipients.map((to) => canonicalPhoneNumber(to));
  if (canonicalRecipients.length === 0) {
    return new Map();
  }

  const rows = await prisma.recipientWarmth.findMany({
    where: {
      fromLine,
      recipient: { in: canonicalRecipients },
    },
    select: {
      recipient: true,
      chatId: true,
      consecutiveUnansweredOutbound: true,
    },
  });

  return new Map(
    rows.map((row) => [
      row.recipient,
      {
        chatId: row.chatId,
        consecutiveUnansweredOutbound: row.consecutiveUnansweredOutbound,
      },
    ]),
  );
}

export async function getUnansweredOutboundCount(
  from: string,
  to: string,
): Promise<number> {
  const fromLine = canonicalPhoneNumber(from);
  const recipient = canonicalPhoneNumber(to);
  const row = await prisma.recipientWarmth.findUnique({
    where: { fromLine_recipient: { fromLine, recipient } },
    select: { consecutiveUnansweredOutbound: true },
  });
  return row?.consecutiveUnansweredOutbound ?? 0;
}

export async function incrementUnansweredOutbound(
  from: string,
  to: string,
  chatId?: string,
): Promise<void> {
  const fromLine = canonicalPhoneNumber(from);
  const recipient = canonicalPhoneNumber(to);
  const now = new Date();
  await prisma.recipientWarmth.upsert({
    where: { fromLine_recipient: { fromLine, recipient } },
    create: {
      fromLine,
      recipient,
      consecutiveUnansweredOutbound: 1,
      lastOutboundAt: now,
      ...(chatId ? { chatId } : {}),
    },
    update: {
      consecutiveUnansweredOutbound: { increment: 1 },
      lastOutboundAt: now,
      ...(chatId ? { chatId } : {}),
    },
  });
}

export async function resetUnansweredOutbound(
  from: string,
  to: string,
  chatId?: string,
  lastInboundAt: Date = new Date(),
): Promise<void> {
  await syncUnansweredOutboundCount(from, to, 0, chatId, lastInboundAt);
}

export async function syncUnansweredOutboundCount(
  from: string,
  to: string,
  count: number,
  chatId?: string,
  lastInboundAt?: Date,
): Promise<void> {
  const fromLine = canonicalPhoneNumber(from);
  const recipient = canonicalPhoneNumber(to);
  await prisma.recipientWarmth.upsert({
    where: { fromLine_recipient: { fromLine, recipient } },
    create: {
      fromLine,
      recipient,
      consecutiveUnansweredOutbound: count,
      ...(count === 0 && lastInboundAt ? { lastInboundAt } : {}),
      ...(chatId ? { chatId } : {}),
    },
    update: {
      consecutiveUnansweredOutbound: count,
      ...(count === 0 && lastInboundAt ? { lastInboundAt } : {}),
      ...(chatId ? { chatId } : {}),
    },
  });
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
