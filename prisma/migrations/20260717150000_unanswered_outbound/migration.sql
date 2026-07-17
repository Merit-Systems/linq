-- AlterTable
ALTER TABLE "RecipientWarmth" ADD COLUMN "consecutiveUnansweredOutbound" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "RecipientWarmth" ADD COLUMN "lastInboundAt" TIMESTAMP(3);
ALTER TABLE "RecipientWarmth" ADD COLUMN "lastOutboundAt" TIMESTAMP(3);
