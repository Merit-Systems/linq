import {
  DAILY_OUTBOUND_FIRST_CAP,
  FIRST_OUTBOUND_PRICE_USD,
} from "./constants";
import { markPairWarmMulti } from "@/lib/message-slots/repository";
import {
  peekDailyMessageSlot,
  reserveDailyMessageSlot,
} from "@/lib/message-slots/repository";
import {
  peekOutboundFirstSlots,
  reserveOutboundFirstSlots,
} from "@/lib/message-slots/outbound-first";
import { writeSendLedger } from "@/lib/message-slots/ledger";
import {
  getMessagePriceUsd,
  maxMessagePrice as maxSurgeMessagePrice,
  MAX_DAILY_MESSAGES,
} from "@/lib/pricing";
import {
  classifyRecipients,
} from "./first-message-validate";

const OUTBOUND_EXHAUSTED =
  "Daily outbound-first capacity reached (50 new recipients/day).";
const MESSAGE_EXHAUSTED = "Daily message capacity reached";

function formatUsd(amount: number): string {
  return amount.toFixed(2);
}

export function maxMessageSendPrice(): string {
  const surgeMax = Number(maxSurgeMessagePrice());
  const surgeCap = Number.isFinite(surgeMax) ? surgeMax : 1.25;
  return formatUsd(
    DAILY_OUTBOUND_FIRST_CAP * FIRST_OUTBOUND_PRICE_USD + surgeCap,
  );
}

export async function quoteFollowUpMessagePrice(): Promise<string> {
  const { slotNumber, retryAfter } = await peekDailyMessageSlot();
  if (slotNumber > MAX_DAILY_MESSAGES) {
    throw Object.assign(new Error(MESSAGE_EXHAUSTED), {
      status: 503,
      retryAfter,
    });
  }
  const price = getMessagePriceUsd(slotNumber);
  if (!price) {
    throw Object.assign(new Error(MESSAGE_EXHAUSTED), {
      status: 503,
      retryAfter,
    });
  }
  return price;
}

export async function reserveFollowUpMessageSlot(
  wallet?: string | null,
  slug = "chats/messages/send",
): Promise<{ messageSlot: number; ledgerId: string; priceUsd: string }> {
  const { slotNumber, retryAfter } = await reserveDailyMessageSlot();
  if (slotNumber > MAX_DAILY_MESSAGES) {
    throw Object.assign(new Error(MESSAGE_EXHAUSTED), {
      status: 503,
      retryAfter,
    });
  }
  const priceUsd = getMessagePriceUsd(slotNumber)!;
  const ledgerId = await writeSendLedger({
    wallet: wallet ?? null,
    slug,
    to: [],
    coldRecipients: [],
    warmRecipients: [],
    priceUsd,
    outboundFirstSlots: 0,
    messageSlot: slotNumber,
  });
  return { messageSlot: slotNumber, ledgerId, priceUsd };
}

export async function quoteMessageSendPrice(
  slug: string,
  body: unknown,
): Promise<string> {
  const classified = await classifyRecipients(
    slug,
    (body ?? {}) as Record<string, unknown>,
  );

  if (classified.cold.length > 0) {
    const outbound = await peekOutboundFirstSlots(classified.cold.length);
    if (!outbound.available) {
      throw Object.assign(new Error(OUTBOUND_EXHAUSTED), {
        status: 503,
        retryAfter: outbound.retryAfter,
      });
    }
  }

  const { slotNumber, retryAfter } = await peekDailyMessageSlot();
  if (slotNumber > MAX_DAILY_MESSAGES) {
    throw Object.assign(new Error(MESSAGE_EXHAUSTED), {
      status: 503,
      retryAfter,
    });
  }

  let total = classified.cold.length * FIRST_OUTBOUND_PRICE_USD;

  if (classified.warm.length > 0 || classified.cold.length === 0) {
    const surgePrice = getMessagePriceUsd(slotNumber);
    if (!surgePrice) {
      throw Object.assign(new Error(MESSAGE_EXHAUSTED), {
        status: 503,
        retryAfter,
      });
    }
    total += Number(surgePrice);
  }

  return formatUsd(total);
}

export async function reserveMessageSendSlots(
  slug: string,
  body: unknown,
  wallet?: string | null,
): Promise<{
  classified: Awaited<ReturnType<typeof classifyRecipients>>;
  messageSlot: number;
  ledgerId: string;
  priceUsd: string;
}> {
  const classified = await classifyRecipients(
    slug,
    (body ?? {}) as Record<string, unknown>,
  );

  const priceUsd = await quoteMessageSendPrice(slug, body);

  if (classified.cold.length > 0) {
    const outbound = await reserveOutboundFirstSlots(classified.cold.length);
    if (outbound.retryAfter) {
      throw Object.assign(new Error(OUTBOUND_EXHAUSTED), {
        status: 503,
        retryAfter: outbound.retryAfter,
      });
    }
  }

  const { slotNumber, retryAfter } = await reserveDailyMessageSlot();
  if (slotNumber > MAX_DAILY_MESSAGES) {
    throw Object.assign(new Error(MESSAGE_EXHAUSTED), {
      status: 503,
      retryAfter,
    });
  }

  const to = ((body ?? {}) as { to?: string[] }).to ?? [];

  const ledgerId = await writeSendLedger({
    wallet: wallet ?? null,
    slug,
    to,
    coldRecipients: classified.cold,
    warmRecipients: classified.warm,
    priceUsd,
    outboundFirstSlots: classified.cold.length,
    messageSlot: slotNumber,
  });

  return { classified, messageSlot: slotNumber, ledgerId, priceUsd };
}

export async function markColdRecipientsWarm(
  cold: string[],
  chatId?: string,
): Promise<void> {
  if (cold.length === 0) return;
  const { ASSIGNED_FROM_LINE } = await import("./constants");
  await markPairWarmMulti(ASSIGNED_FROM_LINE, cold, chatId);
}
