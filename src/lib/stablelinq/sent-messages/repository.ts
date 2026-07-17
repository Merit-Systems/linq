import { prisma } from "@/lib/prisma";
import { ASSIGNED_FROM_LINE } from "@/lib/routing/_shared/constants";
import { toCanonicalWalletAddress } from "@/lib/wallet";
import {
  decodeStablelinqCursor,
  encodeStablelinqCursor,
} from "@/lib/stablelinq/pagination";
import type { Prisma } from "../../../../generated/prisma";

const PREVIEW_MAX = 200;

export class SentMessageNotFoundError extends Error {
  status = 404;
  constructor() {
    super("Sent message not found");
    this.name = "SentMessageNotFoundError";
  }
}

export class MessageNotOwnedError extends Error {
  status = 404;
  constructor() {
    super("Message not found");
    this.name = "MessageNotOwnedError";
  }
}

export interface RecordSentMessageInput {
  wallet: string | null | undefined;
  slug: string;
  body: unknown;
  result: unknown;
  priceUsd: string;
  classified?: { cold: string[]; warm: string[] };
  chatId?: string;
}

function extractPreview(body: unknown): string | null {
  const record = (body ?? {}) as {
    message?: { parts?: Array<{ type?: string; value?: string }> };
  };
  const parts = record.message?.parts ?? [];
  const text = parts
    .filter((p) => p.type === "text" && typeof p.value === "string")
    .map((p) => p.value!)
    .join(" ")
    .trim();
  if (!text) return null;
  return text.length > PREVIEW_MAX ? `${text.slice(0, PREVIEW_MAX)}…` : text;
}

function extractRecipients(body: unknown, result: unknown): string[] {
  const bodyRecord = (body ?? {}) as { to?: string[] };
  if (Array.isArray(bodyRecord.to) && bodyRecord.to.length > 0) {
    return bodyRecord.to;
  }

  const resultRecord = result as {
    handles?: Array<{ handle?: string }>;
    chat?: { handles?: Array<{ handle?: string }> };
  };
  const handles =
    resultRecord.handles ?? resultRecord.chat?.handles ?? [];
  return handles
    .map((h) => h.handle)
    .filter((h): h is string => typeof h === "string");
}

function extractLinqIds(
  result: unknown,
  chatIdFromPath?: string,
): { chatId: string | null; linqMessageId: string | null; fromLine: string } {
  const r = result as {
    chat_id?: string;
    from?: string;
    message?: { id?: string };
    chat?: { id?: string };
  };

  return {
    chatId: chatIdFromPath ?? r.chat_id ?? r.chat?.id ?? null,
    linqMessageId: r.message?.id ?? null,
    fromLine: r.from ?? ASSIGNED_FROM_LINE,
  };
}

function toSummary(row: {
  id: string;
  slug: string;
  fromLine: string;
  recipients: string[];
  chatId: string | null;
  linqMessageId: string | null;
  priceUsd: string;
  coldRecipientCount: number;
  warmRecipientCount: number;
  messagePreview: string | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    slug: row.slug,
    fromLine: row.fromLine,
    recipients: row.recipients,
    chatId: row.chatId,
    linqMessageId: row.linqMessageId,
    priceUsd: row.priceUsd,
    coldRecipientCount: row.coldRecipientCount,
    warmRecipientCount: row.warmRecipientCount,
    messagePreview: row.messagePreview,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function recordSentMessage(
  input: RecordSentMessageInput,
): Promise<{ id: string } | null> {
  const { wallet, slug, body, result, priceUsd, classified, chatId } = input;
  if (!wallet) {
    console.warn("[sent-messages] skipping record — missing wallet on paid send", {
      slug,
    });
    return null;
  }

  const walletAddress = toCanonicalWalletAddress(wallet);
  const { chatId: resolvedChatId, linqMessageId, fromLine } =
    extractLinqIds(result, chatId);
  const recipients = extractRecipients(body, result);
  const messagePreview = extractPreview(body);

  const row = await prisma.sentMessage.create({
    data: {
      walletAddress,
      slug,
      fromLine,
      recipients,
      chatId: resolvedChatId,
      linqMessageId,
      priceUsd,
      coldRecipientCount: classified?.cold.length ?? 0,
      warmRecipientCount: classified?.warm.length ?? 0,
      messagePreview,
      requestBody: (body ?? {}) as Prisma.InputJsonValue,
      linqResponse: (result ?? null) as Prisma.InputJsonValue,
    },
    select: { id: true },
  });

  return row;
}

export async function listSentMessagesForWallet(input: {
  walletAddress: string;
  chatId?: string;
  cursor?: string;
  limit?: number;
}) {
  const walletAddress = toCanonicalWalletAddress(input.walletAddress);
  const limit = input.limit ?? 20;

  const where: Prisma.SentMessageWhereInput = {
    walletAddress,
    ...(input.chatId ? { chatId: input.chatId } : {}),
  };

  if (input.cursor) {
    const decoded = decodeStablelinqCursor(input.cursor);
    if (decoded) {
      where.OR = [
        { createdAt: { lt: new Date(decoded.createdAt) } },
        {
          createdAt: new Date(decoded.createdAt),
          id: { lt: decoded.id },
        },
      ];
    }
  }

  const rows = await prisma.sentMessage.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const last = page.at(-1);

  return {
    sent_messages: page.map(toSummary),
    next_cursor:
      hasMore && last
        ? encodeStablelinqCursor({
            createdAt: last.createdAt.toISOString(),
            id: last.id,
          })
        : null,
  };
}

export async function getSentMessageForWallet(input: {
  walletAddress: string;
  id: string;
}) {
  const walletAddress = toCanonicalWalletAddress(input.walletAddress);
  const row = await prisma.sentMessage.findFirst({
    where: { id: input.id, walletAddress },
  });

  if (!row) {
    throw new SentMessageNotFoundError();
  }

  return {
    ...toSummary(row),
    requestBody: row.requestBody,
    linqResponse: row.linqResponse,
  };
}

export async function assertWalletOwnsMessage(input: {
  walletAddress: string;
  linqMessageId: string;
}): Promise<void> {
  const walletAddress = toCanonicalWalletAddress(input.walletAddress);
  const row = await prisma.sentMessage.findFirst({
    where: { walletAddress, linqMessageId: input.linqMessageId },
    select: { id: true },
  });
  if (!row) {
    throw new MessageNotOwnedError();
  }
}

export async function listChatsForWallet(input: {
  walletAddress: string;
  cursor?: string;
  limit?: number;
}) {
  const walletAddress = toCanonicalWalletAddress(input.walletAddress);
  const limit = input.limit ?? 20;

  const chatIds = await prisma.sentMessage.findMany({
    where: {
      walletAddress,
      chatId: { not: null },
    },
    distinct: ["chatId"],
    select: { chatId: true },
  });

  const ids = chatIds
    .map((r) => r.chatId)
    .filter((id): id is string => typeof id === "string");

  if (ids.length === 0) {
    return { chats: [], next_cursor: null };
  }

  const summaries = await Promise.all(
    ids.map(async (chatId) => {
      const latest = await prisma.sentMessage.findFirst({
        where: { walletAddress, chatId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      const messageCount = await prisma.sentMessage.count({
        where: { walletAddress, chatId },
      });
      const recipients =
        latest?.recipients.length ? latest.recipients : [];
      return {
        chatId,
        recipients,
        messageCount,
        lastSentAt: latest!.createdAt.toISOString(),
        lastMessagePreview: latest!.messagePreview,
        lastSlug: latest!.slug,
        sortKey: latest!.createdAt.getTime(),
        sortId: latest!.id,
      };
    }),
  );

  summaries.sort((a, b) => {
    if (b.sortKey !== a.sortKey) return b.sortKey - a.sortKey;
    return b.sortId.localeCompare(a.sortId);
  });

  let startIndex = 0;
  if (input.cursor) {
    const decoded = decodeStablelinqCursor(input.cursor);
    if (decoded) {
      const idx = summaries.findIndex(
        (s) =>
          s.lastSentAt === decoded.createdAt && s.sortId === decoded.id,
      );
      if (idx >= 0) startIndex = idx + 1;
    }
  }

  const pageSlice = summaries.slice(startIndex, startIndex + limit + 1);
  const hasMore = pageSlice.length > limit;
  const page = hasMore ? pageSlice.slice(0, limit) : pageSlice;
  const last = page.at(-1);

  return {
    chats: page.map(({ sortKey: _s, sortId: _i, ...chat }) => chat),
    next_cursor:
      hasMore && last
        ? encodeStablelinqCursor({
            createdAt: last.lastSentAt,
            id: last.sortId,
          })
        : null,
  };
}
