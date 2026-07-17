import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = {
  sentMessage: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

describe("sent-messages repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("recordSentMessage canonicalizes wallet and stores row", async () => {
    prismaMock.sentMessage.create.mockResolvedValue({ id: "msg-1" });
    const { recordSentMessage } = await import(
      "@/lib/stablelinq/sent-messages/repository"
    );

    await recordSentMessage({
      wallet: "0xAbC123",
      slug: "messages/create",
      body: {
        to: ["+15551234567"],
        message: { parts: [{ type: "text", value: "Hello" }] },
      },
      result: {
        chat_id: "chat-1",
        from: "+12052438809",
        message: { id: "linq-1" },
      },
      priceUsd: "0.50",
      classified: { cold: ["+15551234567"], warm: [] },
    });

    expect(prismaMock.sentMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          walletAddress: "0xabc123",
          chatId: "chat-1",
          linqMessageId: "linq-1",
          messagePreview: "Hello",
          coldRecipientCount: 1,
        }),
      }),
    );
  });

  it("listSentMessagesForWallet scopes by walletAddress", async () => {
    prismaMock.sentMessage.findMany.mockResolvedValue([]);
    const { listSentMessagesForWallet } = await import(
      "@/lib/stablelinq/sent-messages/repository"
    );

    await listSentMessagesForWallet({
      walletAddress: "0xaaa",
      limit: 10,
    });

    expect(prismaMock.sentMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ walletAddress: "0xaaa" }),
        take: 11,
      }),
    );
  });

  it("getSentMessageForWallet throws 404 when not owned", async () => {
    prismaMock.sentMessage.findFirst.mockResolvedValue(null);
    const { getSentMessageForWallet, SentMessageNotFoundError } =
      await import("@/lib/stablelinq/sent-messages/repository");

    await expect(
      getSentMessageForWallet({ walletAddress: "0xaaa", id: "missing" }),
    ).rejects.toBeInstanceOf(SentMessageNotFoundError);
  });

  it("assertWalletOwnsMessage throws when wallet did not send message", async () => {
    prismaMock.sentMessage.findFirst.mockResolvedValue(null);
    const { assertWalletOwnsMessage, MessageNotOwnedError } = await import(
      "@/lib/stablelinq/sent-messages/repository"
    );

    await expect(
      assertWalletOwnsMessage({ walletAddress: "0xaaa", linqMessageId: "linq-x" }),
    ).rejects.toBeInstanceOf(MessageNotOwnedError);
  });
});

describe("wallet isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listSentMessagesForWallet never queries without wallet filter", async () => {
    prismaMock.sentMessage.findMany.mockResolvedValue([]);
    const { listSentMessagesForWallet } = await import(
      "@/lib/stablelinq/sent-messages/repository"
    );

    await listSentMessagesForWallet({ walletAddress: "0xwallet_b" });

    const call = prismaMock.sentMessage.findMany.mock.calls[0]?.[0];
    expect(call.where.walletAddress).toBe("0xwallet_b");
  });
});
