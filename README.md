<p align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0;">
    <tr>
      <td align="center" bgcolor="#141414" style="border-radius: 12px; padding: 28px 24px;">
        <a href="https://linqapp.com">
          <img src="docs/assets/linq-logo.png" alt="Linq" height="44" />
        </a>
        &nbsp;&nbsp;&nbsp;
        <span style="color: #666; font-size: 20px;">×</span>
        &nbsp;&nbsp;&nbsp;
        <a href="https://agentcash.dev">
          <img src="docs/assets/agentcash-logo-dark.svg" alt="AgentCash" height="36" />
        </a>
      </td>
    </tr>
  </table>
</p>

<h1 align="center">StableLinq</h1>

<p align="center">
  <strong>iMessage, RCS &amp; SMS for the Open Agentic Web</strong><br />
  <a href="https://stablelinq.dev"><strong>stablelinq.dev</strong></a>
</p>

---

Agents are becoming a real customer segment — they discover services, compare prices, pay per call, and act without a human in the loop. StableLinq brings that model to conversational messaging: any agent on [AgentCash](https://agentcash.dev) can send and manage iMessage, RCS, and SMS through [Linq](https://linqapp.com), paying with USDC micropayments instead of signing up for another API account.

No API keys. No billing dashboards. No subscriptions. Tell your agent who to text.

## Agentic commerce for messaging

Most messaging APIs were built for apps with human operators — sign up, generate keys, negotiate rate limits, wire up Stripe. Agents don't work that way. They need to discover what's available, see the price upfront, pay, and move on.

StableLinq is listed on the Open Agentic Web like any other AgentCash service. An agent discovers the endpoint, gets a quote, pays via [x402](https://x402.org) or MPP, and the message goes out on iMessage (with RCS and SMS fallback). Reads — chat history, send ledger, warmth checks — are free with wallet identity.

```
Agent                         StableLinq
  |                                |
  |-- "text this number" -------->|
  |<-- 402 + price ----------------|
  |-- pays USDC, retries --------->|
  |<-- delivered ------------------|
```

That's it. One wallet balance, one discovery flow, native messaging protocols.

## What agents can do

- **Send messages** — iMessage first, then RCS, then SMS. Reactions, voice memos, media, attachments.
- **Follow up in existing threads** — warm conversations cost less than cold outreach.
- **Check before sending** — iMessage/RCS capability checks, warmth pre-checks, thread history.
- **Respect reply limits** — block after 10 consecutive unanswered messages to the same recipient (line-wide).
- **Manage their own sends** — edit, delete, or react to messages they paid for.

Every agent shares one outbound line. Your wallet owns what you paid to send; the thread belongs to the conversation.

## Pricing

Pay per call, quoted before you commit.

|                      |                                                                           |
| -------------------- | ------------------------------------------------------------------------- |
| New recipient (cold) | $0.50 — text-only opener, 50/day cap                                      |
| Follow-up (warm)     | $0.05–$1.25 surge pricing                                                 |
| Unanswered limit     | 10 consecutive outbound without a reply — then blocked until they respond |
| Everything else      | $0.02 flat                                                                |
| Reads                | Free with wallet auth                                                     |

Cold openers must be plain text — no links or media on a first touch.

## For agents

Install [AgentCash](https://agentcash.dev), fund your wallet, and discover StableLinq:

```bash
npx @agentcash/discovery stablelinq.dev
```

Full endpoint schemas, composition patterns, and pricing rules: **[stablelinq.dev/llms.txt](https://stablelinq.dev/llms.txt)**

OpenAPI: **[stablelinq.dev/openapi.json](https://stablelinq.dev/openapi.json)**

---

<p align="center">
  <a href="https://linqapp.com">Linq</a> powers delivery · <a href="https://agentcash.dev">AgentCash</a> powers payments
</p>
