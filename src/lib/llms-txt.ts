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
- **Line config** (contact card, webhooks, phone settings): **not for agents** — ops wallet SIWX only (see below).

## Agent Workflow (Progressive)

1. Discover candidate endpoints with \`discover_api_endpoints("https://stablelinq.dev")\`.
2. If discovery reports \`guidanceAvailable=true\` but guidance is omitted, only re-run with \`include_guidance=true\` when domain-level methodology is needed.
3. For selected POST endpoints, call \`check_endpoint_schema\` before first fetch.
4. Execute with \`fetch\`.

**AgentCash response envelope:** Paid 200s from \`fetch\` return \`{ success: true, data: <HTTP body> }\` — parse endpoint fields at \`.data.*\`.

## Schema Discovery

All endpoints support \`check_endpoint_schema\`. Use it on the selected endpoint to confirm request schema and pricing before execution.

## Messaging happy path

1. Optional: \`POST /api/capability/check-imessage\` ($0.02 flat) — \`{ "handles": ["+15551234567"] }\`
2. \`POST /api/messages\` — send to recipient(s). Reuses an existing Linq chat when one exists. **No \`from\` field** — all agents share **+12052438809**. First contact to a **new** recipient must be plain text (no links/media/URLs).
3. \`GET /api/account/sent-messages\` (SIWX) — list **your** sends; note \`chatId\` for follow-ups.
4. \`GET /api/account/chats\` (SIWX) — chat summaries from **your** sends only.
5. \`POST /api/chats/{chatId}/messages\` — follow-ups when you already have a \`chatId\` (warm surge pricing).

Example send:

\`\`\`json
{
  "to": ["+15551234567"],
  "message": { "parts": [{ "type": "text", "value": "Hi — quick question for you." }] }
}
\`\`\`

Response includes \`chat_id\` — save it for step 5.

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

- \`POST\` / \`PATCH /api/contact-card\`
- \`PUT /api/phone-numbers/{phoneNumberId}\`
- \`GET /api/available-number\`
- \`POST\` / \`PUT\` / \`DELETE /api/webhook-subscriptions\` (+ subscription id routes)

## Pricing

Use the **402 quote only** — do not compute manually.

- **Cold outbound-first:** $0.50 per new recipient, 50 new recipients/day global cap. First contact must be plain text (no links/media/URLs).
- **Warm follow-up:** surge $0.05–$1.25, 6,000 messages/day global cap.
- **Non-message paid calls:** $0.02 flat.
- On pool exhaustion: **503** with \`retryAfter\` (seconds until UTC midnight).

## Key agent endpoints

- \`POST /api/messages\` — send to recipient(s); cold start or warm (outbound-first + surge pricing)
- \`POST /api/chats/{chatId}/messages\` — follow-up in existing chat (warm surge only)
- \`GET /api/account/sent-messages\` — your send history (SIWX)
- \`GET /api/account/chats\` — your chats (SIWX)
- \`POST /api/attachments\` — upload attachment metadata before media parts ($0.02)

## Message parts

\`parts[]\` items are discriminated by \`type\`: \`text\`, \`media\`, \`link\`, \`imessage_app\`. Use \`POST /api/attachments\` to obtain \`attachment_id\` before media parts.
`;
