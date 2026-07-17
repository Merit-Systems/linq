// StableLinq backend: linq-write (proxies Linq Partner API v3)
import { handleMessagesCreate } from "./_shared/handlers";
import { messageCreateParamsSchema } from "@/lib/schemas/linq/params/message-create-params";
import { messageCreateResponseSchema } from "@/lib/schemas/linq/responses/message-responses";
import { quoteMessageSendPrice, maxMessageSendPrice } from "@/lib/routing/_shared/message-pricing";
import { validateColdOutbound } from "@/lib/routing/_shared/first-message-validate";
import { MESSAGES_CREATE_DESCRIPTION } from "@/lib/routing/route-descriptions";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("messages-create")
  .path("messages")
  .method("POST")
  .paid((body) => quoteMessageSendPrice("messages/create", body), { ...paidOpts(), maxPrice: maxMessageSendPrice() })
  .body(messageCreateParamsSchema)
  .validate(async (body) => {
    await validateColdOutbound("messages/create", { body });
  })
  .output(messageCreateResponseSchema)
  .description(MESSAGES_CREATE_DESCRIPTION)
  .handler(handleMessagesCreate);
