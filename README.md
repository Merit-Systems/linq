# StableLinq

iMessage, RCS, and SMS for agents — full [Linq Partner API v3](https://linqapp.com) behind [x402](https://x402.org) and MPP micropayments.

Pay with USDC on Base, Solana, or Tempo. No API keys. No accounts.

## Stack

- Next.js 16 + `@agentcash/router`
- `@linqapp/sdk` 0.28.2 (SDK-aligned Zod schemas)
- **Neon Postgres** — cold/warm recipient pairs (`RecipientWarmth`) + wallet-scoped send ledger (`SentMessage`)
- **Upstash Redis** — daily surge + outbound-first counters, webhook dedupe, send ledger (ops)

## Development

```bash
cp .env.example .env.local
# Fill LINQ_API_KEY, PAYEE_ADDRESS, CDP keys, DATABASE_URL (Neon), KV, optional MPP trio

npm install
npm run db:migrate:dev   # first time: apply RecipientWarmth migration
npm run dev
```

Discovery locally:

```bash
npx @agentcash/discovery localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Migrations + production build |
| `npm run test` | Vitest unit tests |
| `npm run test:discord` | Post sample line-status alerts to `DISCORD_WEBHOOK_URL` |
| `npm run ensure:webhook` | Idempotent Linq `phone_number.status_updated` subscription |

See [stablelinq.dev/llms.txt](https://stablelinq.dev/llms.txt) for agent guidance and endpoint composition.

## Pricing

- **Cold outbound-first** (new recipient): **$0.50/recipient**, **50 new recipients/day** global cap — text-only opener required
- **Warm follow-ups** (existing chat or warm pair): surge **$0.05–$1.25**, **6000/day** UTC cap
- **All other paid endpoints**: **$0.02** flat
- **Reads**: free with SIWX — **wallet-scoped only** via `GET /api/account/*` (not raw Linq list endpoints)

## Route backends

| Backend | Routes | Auth |
|---------|--------|------|
| `linq-write` | Paid Linq proxies (send, own-message mutators, …) | x402 / MPP |
| `stablelinq-db` | `GET /account/sent-messages`, `GET /account/chats`, … | SIWX |
| `stablelinq-ops` | Line config (contact card, webhooks, phone settings) | SIWX (ops wallet only) |
| `stablelinq-webhook` | `POST /webhooks/linq` (line status → Discord) | HMAC |

All agents share one outbound line (**+12052438809**). SIWX reads return **only messages the authenticated wallet paid to send**. Warmth and daily caps are **line-wide** (shared across agents). Chat-level mutators (rename, read receipts, typing, participants) are not exposed — multiple agents may send in the same chat and to the same recipient.

## First-message rule

First outbound to a cold recipient must be **text-only** — no links, media, or URLs. Warmth is stored in **Postgres** (`RecipientWarmth` on `(fromLine, recipient)`).

## Line status alerts (Discord)

Linq fires `phone_number.status_updated` when a line's **status** (`ACTIVE`/`FLAGGED`) or **reputation** (`HEALTHY`/`AT_RISK`/`CRITICAL`) changes. StableLinq receives these at `POST /api/webhooks/linq`, verifies HMAC with `LINQ_WEBHOOK_SECRET`, and posts to `DISCORD_WEBHOOK_URL`.

After deploy:

```bash
npm run ensure:webhook
npm run test:discord   # optional: verify Discord formatting locally
```

## Deploy (Vercel)

1. Create project **`stable-linq`** rooted at this repo
2. Provision **Neon** database in the `merit-systems` workspace (`neonctl`); set `DATABASE_URL`
3. Set env vars (all environments):

   | Variable | Notes |
   |----------|-------|
   | `DATABASE_URL` | Neon pooled connection string |
   | `LINQ_API_KEY` | Linq Partner API key |
   | `LINQ_WEBHOOK_SECRET` | Linq webhook signing secret |
   | `DISCORD_WEBHOOK_URL` | Discord incoming webhook for line alerts |
   | `PAYEE_ADDRESS` | Fresh EVM recipient (never reuse) |
   | `SOLANA_PAYEE_ADDRESS` | Fresh Solana recipient |
   | `CDP_API_KEY_ID` / `CDP_API_KEY_SECRET` | Copy from stabledomains |
   | `MPP_SECRET_KEY` | Fresh: `openssl rand -base64 32` |
   | `MPP_CURRENCY` | Tempo USDC `0x20c000000000000000000000b9537d11c60e8b50` |
   | `TEMPO_RPC_URL` | `https://eng:acard-melody-fashion-finish@rpc.mainnet.tempo.xyz` |
   | `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash Redis |
   | `STABLELINQ_OPS_WALLET` | Ops SIWX allowlist (default prod: `0x2b38A4bb7CE552e82D5664224bACC1c3dAf1aB7d`) |
   | `BASE_URL` | `https://stablelinq.dev` (production) |

4. Redeploy after env changes
5. Run `npm run ensure:webhook` once production URL is live
6. Verify dual protocol: `npx @agentcash/discovery stablelinq.dev`
