// StableLinq backend: ops SIWX (line configuration — allowlisted wallet)
import { emptyObjectSchema } from "@/lib/schemas/linq/common";
import { handleWebhookSubscriptionsUpdate, handleWebhookSubscriptionsDelete } from "./_shared/handlers";
import { router } from "@/lib/router";
import { webhookSubscriptionSchema } from "@/lib/schemas/linq/responses/webhook-responses";
import { webhookSubscriptionUpdateParamsSchema } from "@/lib/schemas/linq/params/webhook-subscription-update-params";

export const PUT = router
  .route("webhook-subscriptions-update")
  .path("webhook-subscriptions/:subscriptionId")
  .method("PUT")
  .siwx()
  .body(webhookSubscriptionUpdateParamsSchema)
  .output(webhookSubscriptionSchema)
  .description("Update a webhook subscription.")
  .handler(handleWebhookSubscriptionsUpdate);

export const DELETE = router
  .route("webhook-subscriptions-delete")
  .path("webhook-subscriptions/:subscriptionId")
  .method("DELETE")
  .siwx()
  .output(emptyObjectSchema)
  .description("Delete a webhook subscription.")
  .handler(handleWebhookSubscriptionsDelete);
