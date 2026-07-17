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
    "[StableLinq DB] List messages you paid to send via StableLinq, newest first. Scoped to your SIWX wallet only.",
  )
  .handler(handleAccountSentMessagesList);
