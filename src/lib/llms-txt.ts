export const LLMS_TXT = `# StableLinq — Linq Partner API v3 (multi-agent, shared line)

## Authentication

- **Paid sends / actions:** micropayment via x402 or MPP (USDC on Base, Solana, or Tempo).
- **Reads:** SIWX wallet proof only — free, no API keys, no accounts.
- **Identity = wallet address.** You only see messages **you paid to send**. Other agents on the shared line are invisible to you.

## Base URL

https://stablelinq.dev

StableLinq proxies **Linq Partner API v3** for **writes** (\`https://api.linqapp.com/api/partner/v3\`). **Reads** come from StableLinq's Postgres ledger (\`GET /api/account/*\`), not raw Linq list endpoints.

## Shared line model

**One Linq line (+12052438809), many agents.**

- **Sends:** any paying wallet; attribution stored in \`SentMessage\`.
- **Follow-ups:** any agent may \`POST /api/chats/{chatId}/messages\` if they know the \`chatId\` (no chat ownership gate).
- **Delete / edit / react:** only on **your** messages (\`linqMessageId\` you paid to send).
- **Warmth + daily caps:** **line-wide** — cold/warm is per \`(fromLine, recipient)\`; 50 cold / 6k surge caps are shared across all agents.
- **Recipients:** multiple agents may text the same recipient (one thread on their phone).
- **Line config** (contact card, phone settings): **not for agents** — ops wallet SIWX only (see below).

## Agent Workflow (Progressive)

1. Discover candidate endpoints with \`discover_api_endpoints("https://stablelinq.dev")\`.
2. If discovery reports \`guidanceAvailable=true\` but guidance is omitted, only re-run with \`include_guidance=true\` when domain-level methodology is needed.
3. For selected POST endpoints, call \`check_endpoint_schema\` before first fetch.
4. Execute with \`fetch\`.

**AgentCash response envelope:** Paid 200s from \`fetch\` return \`{ success: true, data: <HTTP body> }\` — parse endpoint fields at \`.data.*\`.

## Schema Discovery

All endpoints support \`check_endpoint_schema\`. Use it on the selected endpoint to confirm request schema and pricing before execution.

## Messaging happy path

1. Optional: \`POST /api/capability/check-imessage\` or \`check-rcs\` ($0.02 flat each) when channel matters.
2. \`POST /api/messages\` — send to recipient(s). See **POST /api/messages** below for pricing, channel fallback, and cold/warm rules.
3. \`GET /api/account/sent-messages\` (SIWX) — list **your** sends; note \`chat_id\` for follow-ups.
4. \`GET /api/account/chats\` (SIWX) — chat summaries from **your** sends only.
5. \`POST /api/chats/{chatId}/messages\` — follow-ups when you already have a \`chat_id\` (warm surge pricing).

Example send:

\`\`\`json
{
  "to": ["+15551234567"],
  "message": { "parts": [{ "type": "text", "value": "Hi — quick question for you." }] }
}
\`\`\`

Response includes \`chat_id\` and \`service\` — save \`chat_id\` for step 5.

## POST /api/messages

Primary send endpoint. Reuses an existing Linq chat when one exists. **No \`from\` field** — all agents share **+12052438809**.

### Delivery channel

StableLinq sends on **iMessage first**, falls back to **RCS**, then **SMS** (best available per recipient).

- Optional override: \`message.preferred_service\` (\`iMessage\` | \`RCS\` | \`SMS\`)
- After send, read top-level \`service\` and \`handles[].service\` in the 200 response
- Optional pre-checks: \`POST /api/capability/check-imessage\`, \`POST /api/capability/check-rcs\` ($0.02 each)

### Cold vs warm

- **Cold** = recipient new to shared line \`+12052438809\` (line-wide warmth, not per wallet)
- **Warm** = line has contacted this recipient before
- Cold sends cost **more** than warm; exact amount from the **402 quote only** — do not compute manually
- **Cold opener validation:** plain text only — enforced **pre-payment** (**422**, no charge). Media/links/URLs on a cold opener return 422 with a message naming the cold recipient(s) and how to fix it
- **Mixed \`to[]\`:** cold fee per new recipient + warm surge component when applicable

### Pricing

- **Cold outbound-first:** $0.50/recipient, **50 new recipients/day** line-wide cap
- **Warm surge:** $0.05–$1.25, **6,000 messages/day** line-wide cap
- **Cold-only send** (all recipients new): cold fee only, no surge on top
- **Cap exhaustion:** **503** + \`retryAfter\` (seconds until UTC midnight)
- **Non-message paid calls:** $0.02 flat

### Request / response

- Body: \`{ to: string[], message: { parts: [...] } }\`
- Response: \`chat_id\`, \`service\`, \`message.id\` (Linq message id)

## Sending line (shared)

All messages send from **+12052438809**. This is **not in the API** — do not ask users for a phone number or pass \`from\`. Daily caps and recipient warmth are **line-wide** (shared across all agents).

## Reads (wallet-scoped only)

Do **not** use Linq list/retrieve routes — they are not exposed to agents.

| Route | Auth | Returns |
|-------|------|---------|
| \`GET /api/account/sent-messages\` | SIWX | Paginated messages **you paid to send** (\`cursor\`, \`limit\`, optional \`chatId\`) |
| \`GET /api/account/sent-messages/{id}\` | SIWX | One sent message (404 if not yours) |
| \`GET /api/account/chats\` | SIWX | Chats derived from **your** sends |

Inbound replies from recipients are not readable yet — only your outbound history.

## Own-message mutators

Requires SIWX/payment wallet + a \`SentMessage\` row for that \`linqMessageId\`:

- \`DELETE /api/messages/{messageId}\`
- \`PATCH /api/messages/{messageId}\`
- \`POST /api/messages/{messageId}/update\` (app card)
- \`POST /api/messages/{messageId}/reactions\`

404 if you did not send that message. You cannot delete/edit/react to another agent's sends.

## Ops-only (not for general agents)

Line configuration routes require SIWX from the **ops allowlisted wallet** (\`STABLELINQ_OPS_WALLET\`, default \`0x2b38…aB7d\`). Other wallets get **403**.

- \`POST\` / \`PATCH /api/internal/contact-card\`
- \`PUT /api/internal/phone-numbers/{phoneNumberId}\`
- \`GET /api/internal/available-number\`

## Key agent endpoints

- \`POST /api/messages\` — send on iMessage → RCS → SMS; cold costs more than warm (see above)
- \`POST /api/chats/{chatId}/messages\` — warm follow-up in existing chat
- \`GET /api/account/sent-messages\` — your send history (SIWX)
- \`GET /api/account/chats\` — your chats (SIWX)
- \`POST /api/attachments\` — optional pre-upload for >10MB, reuse, or latency ($0.02)

## Attachments / media

Send images, videos, documents, and audio as \`media\` parts in \`message.parts[]\`. \`parts[]\` items are discriminated by \`type\`: \`text\`, \`media\`, \`link\`, \`imessage_app\`.

**Cold-start rule:** first contact to a **new** recipient must be plain text only — no media, links, or URLs. Violations return **422 before payment**. Send media on warm follow-ups via \`POST /api/chats/{chatId}/messages\`.

### Send via URL (default, ≤10MB)

Provide a publicly accessible HTTPS URL with a supported media type. No pre-upload step required.

\`\`\`json
{
  "message": {
    "parts": [
      { "type": "text", "value": "Here's the photo" },
      { "type": "media", "url": "https://your-cdn.com/images/photo.jpg" }
    ]
  }
}
\`\`\`

Maximum file size via URL: **10MB**.

### Pre-upload (optional)

Use \`POST /api/attachments\` when you need to:

- Send files **larger than 10MB** (up to **100MB**)
- Send the **same file to many recipients** — upload once, reuse \`attachment_id\` without re-downloading each time
- **Reduce send latency** — file is already stored before the message send

How it works:

1. \`POST /api/attachments\` with \`{ content_type, filename, size_bytes }\` → returns \`attachment_id\`, \`upload_url\` (valid 15 minutes), and \`required_headers\`
2. \`PUT\` raw file bytes to \`upload_url\` with the required headers (no JSON or multipart)
3. Send with \`{ "type": "media", "attachment_id": "<attachment_id>" }\` in message parts

\`DELETE /api/attachments/{attachmentId}\` removes an unused pre-uploaded attachment.
`;
