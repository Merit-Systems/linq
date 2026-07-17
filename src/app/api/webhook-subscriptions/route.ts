import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { handleWebhookSubscriptionsCreate, handleWebhookSubscriptionsList } from "./_shared/handlers";
import { router, paidOpts } from "@/lib/router";
import { webhookSubscriptionCreateParamsSchema } from "@/lib/schemas/linq/params/webhook-subscription-create-params";
import { webhookSubscriptionCreateResponseSchema } from "@/lib/schemas/linq/responses/webhook-responses";
import { webhookSubscriptionListResponseSchema } from "@/lib/schemas/linq/responses/webhook-responses";

export const POST = router
  .route("webhook-subscriptions-create")
  .path("webhook-subscriptions")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(webhookSubscriptionCreateParamsSchema)
  .output(webhookSubscriptionCreateResponseSchema)
  .description("Create a webhook subscription.")
  .handler(handleWebhookSubscriptionsCreate);

export const GET = router
  .route("webhook-subscriptions-list")
  .path("webhook-subscriptions")
  .method("GET")
  .siwx()
  .output(webhookSubscriptionListResponseSchema)
  .description("List webhook subscriptions.")
  .handler(handleWebhookSubscriptionsList);
