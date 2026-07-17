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
    "Messages Warmth — Check cold/warm status for recipients before POST /messages. Requires SIWX wallet auth — free, no payment.",
  )
  .handler(handleMessagesWarmthCheck);
