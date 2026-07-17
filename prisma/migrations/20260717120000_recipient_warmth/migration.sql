-- CreateTable
CREATE TABLE "RecipientWarmth" (
    "id" TEXT NOT NULL,
    "fromLine" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "firstOutboundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecipientWarmth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecipientWarmth_recipient_idx" ON "RecipientWarmth"("recipient");

-- CreateIndex
CREATE UNIQUE INDEX "RecipientWarmth_fromLine_recipient_key" ON "RecipientWarmth"("fromLine", "recipient");
