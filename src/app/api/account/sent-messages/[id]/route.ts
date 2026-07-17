// StableLinq backend: stablelinq-db (Neon Postgres — wallet-scoped reads)
import { router } from "@/lib/router";
import { sentMessageDetailSchema } from "@/lib/schemas/stablelinq/sent-messages";
import { handleAccountSentMessageRetrieve } from "./_shared/handlers";

export const GET = router
  .route("account-sent-messages-retrieve")
  .path("account/sent-messages/{id}")
  .method("GET")
  .siwx()
  .output(sentMessageDetailSchema)
  .description(
    "Retrieve one sent message by StableLinq id. Requires SIWX wallet auth — returns 404 unless owned by your wallet.",
  )
  .handler(handleAccountSentMessageRetrieve);
