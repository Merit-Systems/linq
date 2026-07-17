import type { Message } from "@linqapp/sdk/resources/messages";
import { linq } from "@/lib/linq/client";
import {
  lookupRecipientWarmth,
  resetUnansweredOutbound,
  syncUnansweredOutboundCount,
} from "@/lib/message-slots/repository";
import {
  ASSIGNED_FROM_LINE,
  MAX_CONSECUTIVE_UNANSWERED_OUTBOUND,
} from "./constants";
import { canonicalPhoneNumber } from "./phone-number";

const MESSAGE_PAGE_LIMIT = 25;
const MAX_MESSAGES_FETCHED = 100;

type ThreadMessage = Pick<Message, "is_from_me" | "from" | "sent_at">;

export function countConsecutiveUnansweredFromThread(
  messages: ThreadMessage[],
  recipient: string,
): { count: number; lastInboundAt: Date | null } {
  const canonicalRecipient = canonicalPhoneNumber(recipient);
  let count = 0;
  let lastInboundAt: Date | null = null;

  for (const message of messages) {
    if (message.is_from_me) {
      count++;
      continue;
    }

    const from = message.from ? canonicalPhoneNumber(message.from) : null;
    if (from === canonicalRecipient) {
      if (message.sent_at) {
        lastInboundAt = new Date(message.sent_at);
      }
      break;
    }
  }

  return { count, lastInboundAt };
}

async function resolveChatId(
  recipient: string,
  chatId?: string | null,
): Promise<string | null> {
  if (chatId) {
    return chatId;
  }

  const warm = await lookupRecipientWarmth([recipient]);
  const storedChatId = warm.get(canonicalPhoneNumber(recipient))?.chatId;
  if (storedChatId) {
    return storedChatId;
  }

  const page = await linq.chats.listChats({
    from: ASSIGNED_FROM_LINE,
    to: recipient,
    limit: 1,
  });
  const chats = page.getPaginatedItems();
  return chats[0]?.id ?? null;
}

async function fetchThreadMessages(chatId: string): Promise<ThreadMessage[]> {
  const messages: ThreadMessage[] = [];
  let cursor: string | undefined;

  while (messages.length < MAX_MESSAGES_FETCHED) {
    const page = await linq.chats.messages.list(chatId, {
      limit: MESSAGE_PAGE_LIMIT,
      cursor,
    });
    const items = page.getPaginatedItems();
    if (items.length === 0) {
      break;
    }

    messages.push(...items);

    if (!page.hasNextPage()) {
      break;
    }
    cursor = page.next_cursor ?? undefined;
  }

  return messages;
}

export async function reconcileUnansweredOutbound(input: {
  recipient: string;
  chatId?: string | null;
  postgresCount: number;
}): Promise<number> {
  const recipient = canonicalPhoneNumber(input.recipient);

  let resolvedChatId: string | null;
  try {
    resolvedChatId = await resolveChatId(recipient, input.chatId);
  } catch (err) {
    console.error("[unanswered-outbound] chatId resolve failed:", err);
    return input.postgresCount;
  }

  if (!resolvedChatId) {
    return input.postgresCount;
  }

  let messages: ThreadMessage[];
  try {
    messages = await fetchThreadMessages(resolvedChatId);
  } catch (err) {
    console.error("[unanswered-outbound] thread fetch failed:", err);
    return input.postgresCount;
  }

  const { count: linqCount, lastInboundAt } = countConsecutiveUnansweredFromThread(
    messages,
    recipient,
  );

  if (linqCount >= input.postgresCount) {
    return input.postgresCount;
  }

  try {
    if (linqCount === 0) {
      await resetUnansweredOutbound(
        ASSIGNED_FROM_LINE,
        recipient,
        resolvedChatId,
        lastInboundAt ?? new Date(),
      );
    } else {
      await syncUnansweredOutboundCount(
        ASSIGNED_FROM_LINE,
        recipient,
        linqCount,
        resolvedChatId,
      );
    }
  } catch (err) {
    console.error("[unanswered-outbound] postgres sync failed:", err);
    return input.postgresCount;
  }

  console.info(
    `[unanswered-outbound] reconciled ${recipient} postgres=${input.postgresCount} linq=${linqCount}`,
  );

  return linqCount;
}

export function shouldReconcileUnansweredOutbound(count: number): boolean {
  return count >= MAX_CONSECUTIVE_UNANSWERED_OUTBOUND;
}
