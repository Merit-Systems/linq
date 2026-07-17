import { handleMessagesListThread } from "./_shared/handlers";
import { messageListMessagesThreadParamsSchema } from "@/lib/schemas/linq/params/message-list-messages-thread-params";
import { messageSchema } from "@/lib/schemas/linq/responses/message-responses";
import { router } from "@/lib/router";

export const GET = router
  .route("messages-list-thread")
  .path("messages/:messageId/thread")
  .method("GET")
  .siwx()
  .query(messageListMessagesThreadParamsSchema)
  .output(messageSchema)
  .description("List messages in a thread.")
  .handler(handleMessagesListThread);
