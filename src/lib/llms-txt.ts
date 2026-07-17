export const LLMS_TXT = `# StableLinq — Linq Partner API v3

## Authentication

All paid endpoints require micropayment via x402 or MPP (USDC on Base, Solana, or Tempo). Free read/list endpoints use SIWX wallet proof. No API keys. No accounts.

## Base URL

https://stablelinq.dev

StableLinq proxies **Linq Partner API v3** (\`https://api.linqapp.com/api/partner/v3\`).

## Agent Workflow (Progressive)

1. Discover candidate endpoints with \`discover_api_endpoints("https://stablelinq.dev")\`.
2. If discovery reports \`guidanceAvailable=true\` but guidance is omitted, only re-run with \`include_guidance=true\` when domain-level methodology is needed.
3. For selected POST endpoints, call \`check_endpoint_schema\` before first fetch.
4. Execute with \`fetch\`.

**AgentCash response envelope:** Paid 200s from \`fetch\` return \`{ success: true, data: <HTTP body> }\` — parse endpoint fields at \`.data.*\`.

## Schema Discovery

All endpoints support \`check_endpoint_schema\`. Use it on the selected endpoint to confirm request schema and pricing before execution.

## Messaging happy path (cold start)

1. Optional: \`POST /api/capability/check-imessage\` ($0.02 flat) — \`{ "handles": ["+15551234567"] }\`
2. \`POST /api/chats\` — text-only opener to new recipient(s). **No \`from\` field** — StableLinq owns the sending line.
3. \`POST /api/chats/{chatId}/messages\` — follow-ups in the same chat (links/media OK once warm).
4. \`GET /api/chats\` and \`GET /api/chats/{chatId}/messages\` — SIWX list/read.

Example cold opener:

\`\`\`json
{
  "to": ["+15551234567"],
  "message": { "parts": [{ "type": "text", "value": "Hi — quick question for you." }] }
}
\`\`\`

## Sending line

All messages send from **+12052438809**. This is **not in the API** — do not ask users for a phone number or pass \`from\`.

## Pricing

Use the **402 quote only** — do not compute manually.

- **Cold outbound-first:** $0.50 per new recipient, 50 new recipients/day global cap. First contact must be plain text (no links/media/URLs).
- **Warm follow-up:** surge $0.05–$1.25, 6,000 messages/day global cap.
- **Non-message paid calls:** $0.02 flat.
- On pool exhaustion: **503** with \`retryAfter\` (seconds until UTC midnight).

## Key endpoints

- \`POST /api/chats\` — create chat + initial message (outbound-first + surge pricing)
- \`POST /api/messages\` — send without chat ID (same pricing rules)
- \`POST /api/chats/{chatId}/messages\` — send to existing chat (warm surge only)
- \`POST /api/attachments\` — upload attachment metadata before media parts ($0.02)
- \`GET /api/chats\` — list chats (SIWX)
- \`GET /api/messages/{messageId}\` — retrieve message (SIWX)

## Message parts

\`parts[]\` items are discriminated by \`type\`: \`text\`, \`media\`, \`link\`, \`imessage_app\`. Use \`POST /api/attachments\` to obtain \`attachment_id\` before media parts.
`;
