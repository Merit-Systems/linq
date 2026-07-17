import { prisma } from "@/lib/prisma";
import { ASSIGNED_FROM_LINE } from "@/lib/routing/_shared/constants";

export class ChatNotFoundError extends Error {
  status = 404;
  constructor() {
    super("Chat not found");
    this.name = "ChatNotFoundError";
  }
}

export async function assertChatKnownOnLine(chatId: string): Promise<void> {
  const fromLine = ASSIGNED_FROM_LINE;

  const known =
    (await prisma.sentMessage.findFirst({
      where: { chatId, fromLine },
      select: { id: true },
    })) ??
    (await prisma.recipientWarmth.findFirst({
      where: { chatId, fromLine },
      select: { id: true },
    }));

  if (!known) {
    throw new ChatNotFoundError();
  }
}
