-- CreateIndex
CREATE INDEX "RecipientWarmth_chatId_idx" ON "RecipientWarmth"("chatId");

-- CreateIndex
CREATE INDEX "RecipientWarmth_fromLine_chatId_idx" ON "RecipientWarmth"("fromLine", "chatId");

-- CreateIndex
CREATE INDEX "SentMessage_chatId_idx" ON "SentMessage"("chatId");

-- CreateIndex
CREATE INDEX "SentMessage_fromLine_chatId_idx" ON "SentMessage"("fromLine", "chatId");
