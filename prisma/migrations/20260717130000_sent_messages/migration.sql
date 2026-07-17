-- CreateTable
CREATE TABLE "SentMessage" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fromLine" TEXT NOT NULL,
    "recipients" TEXT[],
    "chatId" TEXT,
    "linqMessageId" TEXT,
    "priceUsd" TEXT NOT NULL,
    "coldRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "warmRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "messagePreview" TEXT,
    "requestBody" JSONB NOT NULL,
    "linqResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SentMessage_walletAddress_createdAt_id_idx" ON "SentMessage"("walletAddress", "createdAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "SentMessage_walletAddress_chatId_idx" ON "SentMessage"("walletAddress", "chatId");

-- CreateIndex
CREATE INDEX "SentMessage_linqMessageId_idx" ON "SentMessage"("linqMessageId");
