// StableLinq backend: ops SIWX (line configuration — allowlisted wallet)
import { handleWebhookSubscriptionsCreate } from "./_shared/handlers";
import { router } from "@/lib/router";
import { webhookSubscriptionCreateParamsSchema } from "@/lib/schemas/linq/params/webhook-subscription-create-params";
import { webhookSubscriptionCreateResponseSchema } from "@/lib/schemas/linq/responses/webhook-responses";

export const POST = router
  .route("webhook-subscriptions-create")
  .path("webhook-subscriptions")
  .method("POST")
  .siwx()
  .body(webhookSubscriptionCreateParamsSchema)
  .output(webhookSubscriptionCreateResponseSchema)
  .description("Create a webhook subscription.")
  .handler(handleWebhookSubscriptionsCreate);
