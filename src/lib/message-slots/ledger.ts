import { randomUUID } from "node:crypto";
import { ASSIGNED_FROM_LINE } from "@/lib/routing/_shared/constants";
import {
  redis,
  sendIndexKey,
  sendRecordKey,
  secondsUntilMidnightUtc,
} from "./kv";

const SEND_TTL_SECONDS = 90 * 24 * 60 * 60;
const SEND_INDEX_MAX = 500;

export interface SendLedgerRecord {
  wallet: string | null;
  slug: string;
  from: string;
  to: string[];
  coldRecipients: string[];
  warmRecipients: string[];
  priceUsd: string;
  outboundFirstSlots: number;
  messageSlot: number;
  createdAt: string;
  linqMessageId?: string;
}

export async function writeSendLedger(
  record: Omit<SendLedgerRecord, "from" | "createdAt"> & {
    from?: string;
    createdAt?: string;
  },
): Promise<string> {
  const id = randomUUID();
  const full: SendLedgerRecord = {
    from: ASSIGNED_FROM_LINE,
    createdAt: new Date().toISOString(),
    ...record,
  };
  await redis.set(sendRecordKey(id), full, { ex: SEND_TTL_SECONDS });

  const indexKey = sendIndexKey();
  await redis.lpush(indexKey, id);
  await redis.ltrim(indexKey, 0, SEND_INDEX_MAX - 1);
  await redis.expire(indexKey, SEND_TTL_SECONDS);

  return id;
}

export async function attachLinqMessageId(
  ledgerId: string,
  linqMessageId: string,
): Promise<void> {
  const key = sendRecordKey(ledgerId);
  const existing = await redis.get<SendLedgerRecord>(key);
  if (!existing) return;
  await redis.set(
    key,
    { ...existing, linqMessageId },
    { ex: SEND_TTL_SECONDS },
  );
}

export { secondsUntilMidnightUtc };
