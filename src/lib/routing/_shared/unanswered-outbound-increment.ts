import { linq } from "@/lib/linq/client";
import { incrementUnansweredOutbound } from "@/lib/message-slots/repository";
import { ASSIGNED_FROM_LINE } from "./constants";
import { canonicalPhoneNumber } from "./phone-number";

export async function incrementUnansweredOutboundForChat(
  chatId: string,
): Promise<void> {
  const chat = await linq.chats.retrieve(chatId);
  const recipients = chat.handles
    .filter((handle) => !handle.is_me)
    .map((handle) => canonicalPhoneNumber(handle.handle));

  await Promise.all(
    recipients.map((recipient) =>
      incrementUnansweredOutbound(ASSIGNED_FROM_LINE, recipient, chatId),
    ),
  );
}
