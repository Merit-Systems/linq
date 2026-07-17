// StableLinq backend: stablelinq-db (Neon Postgres — wallet-scoped reads)
import { router } from "@/lib/router";
import {
  accountChatsListParamsSchema,
  accountChatsListResponseSchema,
} from "@/lib/schemas/stablelinq/account-chats";
import { handleAccountChatsList } from "./_shared/handlers";

export const GET = router
  .route("account-chats")
  .path("account/chats")
  .method("GET")
  .siwx()
  .query(accountChatsListParamsSchema)
  .output(accountChatsListResponseSchema)
  .description(
    "[StableLinq DB] List chats you have sent messages in (derived from your paid sends). Scoped to your SIWX wallet only.",
  )
  .handler(handleAccountChatsList);
