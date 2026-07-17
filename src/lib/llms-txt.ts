export const LLMS_TXT = `# StableLinq — Linq Partner API v3 (multi-agent, shared line)

## Authentication

- **Paid sends / actions:** micropayment via x402 or MPP (USDC on Base or Tempo).
- **Reads:** SIWX wallet proof only — free, no API keys, no accounts.
- **Ledger identity = wallet address.** \`GET /account/sent-messages\` and \`GET /account/chats\` show only messages **you paid to send**.
- **Thread reads:** \`GET /account/chats/{chatId}/messages\` returns the full conversation on a StableLinq-known chat (inbound replies + all outbound on the shared line).

## Agent rules (mandatory)

- **Warmth:** Never tell the user a recipient is cold or warm until you call \`POST /api/messages/warmth\` (free SIWX) with the exact \`to[]\` you plan to send. Do not infer from memory, user claims, or absence of a local \`chat_id\`. Warmth is line-wide on **+12052438809** — another agent may have already contacted this recipient.
- **Price:** Never quote a send cost to the user until you have the **402 quoted price** for the exact request body. Probe with \`check_endpoint_schema\` (sample body, no payment) or an unpaid \`POST /api/messages\` 402. Do not warn the user about cost before probing.
- **Forbidden:** Do not cite \`maxPrice\`, per-request bounds ($0.05–$26.25), or pricing formulas as the send cost. Those are **authorization ceilings**, not quotes.
- **Typical single-recipient costs (reference only — not for user-facing quotes):** warm ≈ $0.05–$1.25; cold minimum $0.50.

## Base URL

https://stablelinq.dev

StableLinq proxies **Linq Partner API v3** for **writes** (\`https://api.linqapp.com/api/partner/v3\`). **Ledger reads** come from Postgres (\`GET /api/account/sent-messages\`, \`GET /api/account/chats\`). **Thread reads** proxy Linq message history for StableLinq-known chats (\`GET /api/account/chats/{chatId}/messages\`).

## Shared line model

**One Linq line (+12052438809), many agents.**

- **Sends:** any paying wallet; attribution stored in \`SentMessage\`.
- **Follow-ups:** any agent may \`POST /api/chats/{chatId}/messages\` if they know the \`chatId\` (no chat ownership gate).
- **Thread reads:** any SIWX agent may \`GET /api/account/chats/{chatId}/messages\` for a \`chatId\` StableLinq created on the line — includes recipient replies and **all agents' outbound** in that chat.
- **Delete / edit / react:** only on **your** messages (\`linqMessageId\` you paid to send).
- **Warmth + daily caps:** **line-wide** — cold/warm is per \`(fromLine, recipient)\`; 50 cold / 6k surge caps are shared across all agents.
- **Unanswered limit:** **line-wide** — block the 11th consecutive outbound when a recipient has not replied after 10 messages; replying resets the streak. If blocked but they replied and the webhook was missed, the next send or warmth check reconciles from the Linq thread.
- **Recipients:** multiple agents may text the same recipient (one thread on their phone).

## No chat ownership

Chats belong to the **shared line**, not your wallet — you do not own a \`chat_id\`.

- Any agent with a \`chat_id\` may send follow-ups (\`POST /api/chats/{chatId}/messages\`) or read the thread (\`GET /api/account/chats/{chatId}/messages\`)
- Other agents may message the same recipient; warmth is line-wide — your cold send warms the pair for everyone
- \`GET /account/chats\` and \`GET /account/sent-messages\` are **your ledger**, not proof of exclusive chat control
- Only delete/edit/react is limited to messages **you** paid to send

Do not tell users "I'll message you from my number" or treat the chat as a private inbox — all agents share **+12052438809**.

## Agent Workflow (Progressive)

1. Discover candidate endpoints with \`discover_api_endpoints("https://stablelinq.dev")\`.
2. If discovery reports \`guidanceAvailable=true\` but guidance is omitted, only re-run with \`include_guidance=true\` when domain-level methodology is needed.
3. For selected POST endpoints, call \`check_endpoint_schema\` before first fetch.
4. Execute with \`fetch\`.

For messaging tasks, follow **Messaging happy path** rules below even when using \`discover_api_endpoints\` / \`check_endpoint_schema\`.

**AgentCash response envelope:** Paid 200s from \`fetch\` return \`{ success: true, data: <HTTP body> }\` — parse endpoint fields at \`.data.*\`.

## Schema Discovery

All endpoints support \`check_endpoint_schema\`. Use it on the selected endpoint to confirm request schema and pricing before execution.

## Messaging happy path

1. **Required:** \`POST /api/messages/warmth\` (free SIWX) with the exact \`to[]\` — before any send **or** before telling the user cold/warm status.
2. **Required before quoting cost:** probe the 402 quote (\`check_endpoint_schema\` with sample body, or unpaid \`POST /api/messages\`) — read \`checkout_session.quoted_price_usd\` or the x402 amount; tell the user only that amount.
3. \`POST /api/messages\` — send to recipient(s); pay the quoted 402 amount only. See **POST /api/messages** below for pricing, channel fallback, and cold/warm rules.
4. Optional: \`POST /api/capability/check-imessage\` or \`check-rcs\` ($0.02 flat each) when channel matters.
5. \`GET /api/account/sent-messages\` (SIWX) — list **your** sends; note \`chat_id\` for follow-ups (\`chat_id\` is line-shared — not your private chat).
6. \`GET /api/account/chats/{chatId}/messages\` (SIWX) — poll full thread for inbound replies (\`cursor\`, \`limit\`).
7. \`GET /api/account/chats\` (SIWX) — chat summaries from **your** sends only.
8. \`POST /api/chats/{chatId}/messages\` — follow-ups when you already have a \`chat_id\` (warm surge pricing)
9. Optional: \`POST /api/chats/{chatId}/voicememo\` — send an iMessage voice memo to an existing chat (warm surge pricing).

Example send:

\`\`\`json
{
  "to": ["+15551234567"],
  "message": { "parts": [{ "type": "text", "value": "Hi — quick question for you." }] }
}
\`\`\`

Response includes \`chat_id\` and \`service\` — save \`chat_id\` for thread reads and follow-ups (steps 6–9). The \`chat_id\` is a line reference any agent on **+12052438809** may reuse; you do not own the chat.

## POST /api/messages

Primary send endpoint. Reuses an existing Linq chat when one exists. **No \`from\` field** — all agents share **+12052438809**.

### Delivery channel

StableLinq sends on **iMessage first**, falls back to **RCS**, then **SMS** (best available per recipient).

- Optional override: \`message.preferred_service\` (\`iMessage\` | \`RCS\` | \`SMS\`)
- After send, read top-level \`service\` and \`handles[].service\` in the 200 response
- Optional pre-checks: \`POST /api/capability/check-imessage\`, \`POST /api/capability/check-rcs\` ($0.02 each, Linq proxy)
- Warmth pre-check: \`POST /api/messages/warmth\` (free SIWX) — body \`{ to: ["+1..."] }\` returns \`warmth\` per recipient (\`cold\` | \`warm\`), \`chat_id\` when warm, \`consecutive_unanswered_outbound\`, and \`send_blocked\` when the 10-message streak is exhausted

### Cold vs warm

- **Cold** = recipient new to shared line \`+12052438809\` (line-wide warmth, not per wallet)
- **Warm** = line has contacted this recipient before
- **Required** pre-check before stating cold/warm: \`POST /api/messages/warmth\` (free SIWX)
- Exact amount from the **402 quote only** — do not compute manually; do not warn the user about cost before probing
- **Cold opener validation:** plain text only — enforced **pre-payment** (**422**, no charge). Media/links/URLs on a cold opener return 422 with a message naming the cold recipient(s) and how to fix it
- **Unanswered limit:** if a warm recipient has **10 consecutive outbound messages without replying**, the next send returns **422** (line-wide, pre-payment). Replying resets the streak. If blocked but the recipient has replied and the webhook was missed, the next send or warmth check reconciles from the Linq thread before rejecting. Pre-check via \`POST /api/messages/warmth\` (\`send_blocked\`, \`consecutive_unanswered_outbound\`)

### Pricing

All send prices come from the **402 quote** — do not compute manually. Do not warn the user about cost before probing.

- **Cold outbound-first:** $0.50/recipient, **50 new recipients/day** line-wide cap
- **Warm surge:** $0.05–$1.25 per message slot, **6,000 messages/day** line-wide cap
- **Cold-only** (all recipients new): \`max($0.50 × recipients, surge slot price)\` — never cheaper than warm at the same slot
- **Warm-only** (all recipients warm, or follow-up in existing chat): surge slot price only
- **Mixed \`to[]\`:** \`($0.50 × cold recipients) + surge slot price\`
- **Authorization ceiling (NOT quoted price):** x402 \`maxPrice\` is the wallet authorization cap, not what you pay. The only user-facing send cost is the decimal in the 402 challenge (\`checkout_session.quoted_price_usd\` on \`POST /api/messages\`, or the x402 amount field).
  - \`POST /api/messages\` \`maxPrice\`: **$26.25** — ceiling for worst-case batch (\`50 × $0.50 + $1.25\` max surge); a single warm send is typically **$0.05–$1.25**, a single cold send is at least **$0.50**
  - Cold-only same request ceiling: up to **$25.00** (\`max(50 × $0.50, surge)\`)
  - \`POST /api/chats/{chatId}/messages\` and \`/voicememo\`: **$0.05–$1.25** surge ceiling (quoted price is in the 402)
- **Cap exhaustion:** **503** + \`retryAfter\` (seconds until UTC midnight)
- **Non-message paid calls:** $0.02 flat (Linq capability checks, attachment upload/delete, message edit/delete/react)
- **Warmth pre-check:** \`POST /api/messages/warmth\` — free SIWX (Postgres read)

### Request / response

- Body: \`{ to: string[], message: { parts: [...] } }\`
- Response: \`chat_id\`, \`service\`, \`message.id\` (Linq message id). \`chat_id\` is shared across agents on the line — not wallet-owned.

### Warmth pre-check

- \`POST /api/messages/warmth\` — free SIWX; same \`to[]\` shape as send. Returns line-wide cold/warm per recipient, \`chat_id\` when warm, \`consecutive_unanswered_outbound\`, and \`send_blocked\`. Returned \`chat_id\` is a line reference, not wallet-owned — any agent may follow up.

## Sending line (shared)

All messages send from **+12052438809**. This is **not in the API** — do not ask users for a phone number or pass \`from\`. Daily caps and recipient warmth are **line-wide** (shared across all agents).

## Reads

**Ledger reads = your wallet only. Thread reads = the whole shared line** — do not confuse them:

| Route | Auth | Returns |
|-------|------|---------|
| \`GET /api/account/sent-messages\` | SIWX | Paginated messages **you paid to send** (\`cursor\`, \`limit\`, optional \`chatId\`) |
| \`GET /api/account/sent-messages/{id}\` | SIWX | One sent message (404 if not yours) |
| \`GET /api/account/chats\` | SIWX | Chats derived from **your** sends |
| \`GET /api/account/chats/{chatId}/messages\` | SIWX | Full Linq thread for a StableLinq-known chat — inbound replies + all line outbound (\`cursor\`, \`limit\`) |

\`GET /api/account/chats/{chatId}/messages\` requires a \`chat_id\` from a prior send (or another agent's send on the line). Unknown \`chatId\` → **404**. Thread includes other agents' outbound on the shared line, not just yours.

## Own-message mutators

Requires payment wallet + a \`SentMessage\` row for that \`linqMessageId\`. **$0.02 flat** each:

- \`DELETE /api/messages/{messageId}\`
- \`PATCH /api/messages/{messageId}\`
- \`POST /api/messages/{messageId}/update\` (app card)
- \`POST /api/messages/{messageId}/reactions\`

404 if you did not send that message. You cannot delete/edit/react to another agent's sends.

## Key agent endpoints

- \`POST /api/messages/warmth\` — **required** cold/warm lookup before send or before telling the user cold/warm (free SIWX)
- \`POST /api/messages\` — send on iMessage → RCS → SMS; see **POST /api/messages** for cold/warm pricing
- \`POST /api/chats/{chatId}/messages\` — warm follow-up in existing chat (surge pricing)
- \`POST /api/chats/{chatId}/voicememo\` — iMessage voice memo in existing chat (surge pricing)
- \`GET /api/account/sent-messages\` — your send history (SIWX)
- \`GET /api/account/chats\` — your chats (SIWX)
- \`GET /api/account/chats/{chatId}/messages\` — full thread incl. inbound replies (SIWX)
- \`POST /api/attachments\` — optional pre-upload for >10MB, reuse, or latency ($0.02)
- \`DELETE /api/attachments/{attachmentId}\` — remove unused pre-upload ($0.02)

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
