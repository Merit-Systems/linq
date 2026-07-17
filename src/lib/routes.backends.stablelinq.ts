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
  {
    method: "POST",
    path: "messages/warmth",
    slug: "messages/warmth",
    backend: "stablelinq-db",
  },
] as const;

export const LINQ_READ_ROUTES = [
  {
    method: "GET",
    path: "account/chats/{chatId}/messages",
    slug: "account/chats/messages/list",
    backend: "linq-read",
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
  | "linq-read"
  | "stablelinq-db"
  | "stablelinq-webhook";
