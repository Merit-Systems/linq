import { linq } from "@/lib/linq/client";
import {
  getUnansweredOutboundCount,
  lookupRecipientWarmth,
} from "@/lib/message-slots/repository";
import { classifyRecipients } from "./first-message-validate";
import {
  ASSIGNED_FROM_LINE,
  MAX_CONSECUTIVE_UNANSWERED_OUTBOUND,
} from "./constants";
import { canonicalPhoneNumber } from "./phone-number";
import {
  reconcileUnansweredOutbound,
  shouldReconcileUnansweredOutbound,
} from "./unanswered-outbound-reconcile";

export function unansweredOutboundBlockedMessage(recipient: string): string {
  return `Recipient ${recipient} has not replied after ${MAX_CONSECUTIVE_UNANSWERED_OUTBOUND} consecutive messages from this line. Wait for a reply before sending again.`;
}

function throwIfBlocked(recipient: string, count: number): void {
  if (count >= MAX_CONSECUTIVE_UNANSWERED_OUTBOUND) {
    throw Object.assign(
      new Error(unansweredOutboundBlockedMessage(recipient)),
      { status: 422 },
    );
  }
}

async function assertRecipientAllowed(
  recipient: string,
  chatId?: string | null,
): Promise<void> {
  const canonical = canonicalPhoneNumber(recipient);
  let count = await getUnansweredOutboundCount(ASSIGNED_FROM_LINE, canonical);

  if (shouldReconcileUnansweredOutbound(count)) {
    count = await reconcileUnansweredOutbound({
      recipient: canonical,
      chatId,
      postgresCount: count,
    });
  }

  throwIfBlocked(canonical, count);
}

async function getChatRecipients(chatId: string): Promise<string[]> {
  const chat = await linq.chats.retrieve(chatId);
  return chat.handles
    .filter((handle) => !handle.is_me)
    .map((handle) => canonicalPhoneNumber(handle.handle));
}

export async function assertUnansweredOutboundAllowedForChat(
  chatId: string,
): Promise<void> {
  const recipients = await getChatRecipients(chatId);
  await Promise.all(
    recipients.map((recipient) => assertRecipientAllowed(recipient, chatId)),
  );
}

export async function assertUnansweredOutboundAllowed(input: {
  slug: string;
  body?: unknown;
}): Promise<void> {
  if (input.slug !== "messages/create") {
    return;
  }

  const record = (input.body ?? {}) as { to?: string[] };
  const to = record.to;
  if (!to?.length) return;

  const { warm } = await classifyRecipients(input.slug, record);
  const warmByRecipient = await lookupRecipientWarmth(warm);

  await Promise.all(
    warm.map((recipient) => {
      const canonical = canonicalPhoneNumber(recipient);
      const chatId = warmByRecipient.get(canonical)?.chatId ?? null;
      return assertRecipientAllowed(recipient, chatId);
    }),
  );
}
