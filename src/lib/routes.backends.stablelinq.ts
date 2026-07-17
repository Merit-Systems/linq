export const STABLELINQ_DB_ROUTES = [
  {
    method: "GET",
    path: "account/sent-messages",
    slug: "account/sent-messages",
    backend: "stablelinq-db",
  },
  {
    method: "GET",
    path: "account/sent-messages/{id}",
    slug: "account/sent-messages/retrieve",
    backend: "stablelinq-db",
  },
  {
    method: "GET",
    path: "account/chats",
    slug: "account/chats",
    backend: "stablelinq-db",
  },
] as const;

export const STABLELINQ_WEBHOOK_ROUTES = [
  {
    method: "POST",
    path: "webhooks/linq",
    slug: "webhooks/linq",
    backend: "stablelinq-webhook",
  },
] as const;

export type RouteBackend =
  | "linq-write"
  | "stablelinq-db"
  | "stablelinq-ops"
  | "stablelinq-webhook";
