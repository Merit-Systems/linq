// StableLinq backend: stablelinq-db (Neon Postgres — line-wide warmth reads)
import { router } from "@/lib/router";
import {
  warmthCheckParamsSchema,
  warmthCheckResponseSchema,
} from "@/lib/schemas/stablelinq/warmth-check";
import { handleMessagesWarmthCheck } from "./_shared/handlers";

export const POST = router
  .route("messages-warmth")
  .path("messages/warmth")
  .method("POST")
  .siwx()
  .body(warmthCheckParamsSchema)
  .output(warmthCheckResponseSchema)
  .description(
    "Messages Warmth — Required first step before POST /messages or before telling the user cold/warm or send cost. Returns quoted_price_usd for the exact to[], cold/warm status, consecutive unanswered outbound count, and send_blocked per recipient. Requires SIWX wallet auth — free, no payment.",
  )
  .handler(handleMessagesWarmthCheck);
