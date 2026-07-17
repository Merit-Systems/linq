// Linq write proxy route metadata.
export const LINQ_WRITE_ROUTES = [
  {
    "method": "POST",
    "path": "capability/check-imessage",
    "slug": "capability/check-imessage",
    "backend": "linq-write"
  },
  {
    "method": "POST",
    "path": "capability/check-rcs",
    "slug": "capability/check-rcs",
    "backend": "linq-write"
  },
  {
    "method": "POST",
    "path": "chats/{chatId}/voicememo",
    "slug": "chats/send-voicememo",
    "backend": "linq-write"
  },
  {
    "method": "POST",
    "path": "chats/{chatId}/messages",
    "slug": "chats/messages/send",
    "backend": "linq-write"
  },
  {
    "method": "POST",
    "path": "messages",
    "slug": "messages/create",
    "backend": "linq-write"
  },
  {
    "method": "DELETE",
    "path": "messages/{messageId}",
    "slug": "messages/delete",
    "backend": "linq-write"
  },
  {
    "method": "PATCH",
    "path": "messages/{messageId}",
    "slug": "messages/update",
    "backend": "linq-write"
  },
  {
    "method": "POST",
    "path": "messages/{messageId}/update",
    "slug": "messages/update-app-card",
    "backend": "linq-write"
  },
  {
    "method": "POST",
    "path": "messages/{messageId}/reactions",
    "slug": "messages/add-reaction",
    "backend": "linq-write"
  },
  {
    "method": "POST",
    "path": "attachments",
    "slug": "attachments/create",
    "backend": "linq-write"
  },
  {
    "method": "DELETE",
    "path": "attachments/{attachmentId}",
    "slug": "attachments/delete",
    "backend": "linq-write"
  }
] as const;

export const STABLELINQ_OPS_ROUTES = [
  {
    "method": "POST",
    "path": "internal/contact-card",
    "slug": "contact-card/create",
    "backend": "stablelinq-ops"
  },
  {
    "method": "PATCH",
    "path": "internal/contact-card",
    "slug": "contact-card/update",
    "backend": "stablelinq-ops"
  },
  {
    "method": "PUT",
    "path": "internal/phone-numbers/{phoneNumberId}",
    "slug": "phone-numbers/update",
    "backend": "stablelinq-ops"
  },
  {
    "method": "GET",
    "path": "internal/available-number",
    "slug": "available-number/retrieve",
    "backend": "stablelinq-ops"
  }
] as const;
