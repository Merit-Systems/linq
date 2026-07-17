import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { emptyObjectSchema } from "@/lib/schemas/linq/common";
import { handleWebhookSubscriptionsRetrieve, handleWebhookSubscriptionsUpdate, handleWebhookSubscriptionsDelete } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";
import { webhookSubscriptionSchema } from "@/lib/schemas/linq/responses/webhook-responses";
import { webhookSubscriptionUpdateParamsSchema } from "@/lib/schemas/linq/params/webhook-subscription-update-params";

export const GET = router
  .route("webhook-subscriptions-retrieve")
  .path("webhook-subscriptions/:subscriptionId")
  .method("GET")
  .siwx()
  .output(webhookSubscriptionSchema)
  .description("Retrieve a webhook subscription.")
  .handler(handleWebhookSubscriptionsRetrieve);

export const PUT = router
  .route("webhook-subscriptions-update")
  .path("webhook-subscriptions/:subscriptionId")
  .method("PUT")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(webhookSubscriptionUpdateParamsSchema)
  .output(webhookSubscriptionSchema)
  .description("Update a webhook subscription.")
  .handler(handleWebhookSubscriptionsUpdate);

export const DELETE = router
  .route("webhook-subscriptions-delete")
  .path("webhook-subscriptions/:subscriptionId")
  .method("DELETE")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .output(emptyObjectSchema)
  .description("Delete a webhook subscription.")
  .handler(handleWebhookSubscriptionsDelete);
