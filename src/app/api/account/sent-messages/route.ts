// StableLinq backend: stablelinq-db (Neon Postgres — wallet-scoped reads)
import { router } from "@/lib/router";
import {
  sentMessagesListParamsSchema,
  sentMessagesListResponseSchema,
} from "@/lib/schemas/stablelinq/sent-messages";
import { handleAccountSentMessagesList } from "./_shared/handlers";

export const GET = router
  .route("account-sent-messages")
  .path("account/sent-messages")
  .method("GET")
  .siwx()
  .query(sentMessagesListParamsSchema)
  .output(sentMessagesListResponseSchema)
  .description(
    "List messages you paid to send via StableLinq, newest first. Requires SIWX wallet auth — scoped to your wallet only.",
  )
  .handler(handleAccountSentMessagesList);
