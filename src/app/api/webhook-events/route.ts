import { handleWebhookEventsList } from "./_shared/handlers";
import { router } from "@/lib/router";
import { webhookEventListResponseSchema } from "@/lib/schemas/linq/responses/webhook-responses";

export const GET = router
  .route("webhook-events-list")
  .path("webhook-events")
  .method("GET")
  .siwx()
  .output(webhookEventListResponseSchema)
  .description("List available webhook event types.")
  .handler(handleWebhookEventsList);
