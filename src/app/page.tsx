import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <p className="mb-3 text-sm font-medium tracking-wide text-[var(--accent)] uppercase">
        StableLinq
      </p>
      <h1 className="mb-4 text-4xl font-semibold tracking-tight">
        iMessage, RCS &amp; SMS for agents
      </h1>
      <p className="mb-8 text-lg leading-relaxed text-neutral-600">
        Full Linq Partner API v3 behind x402 and MPP micropayments. Send and
        manage chats with USDC — no API keys, no accounts. Agents pay per call;
        reads are free with SIWX and scoped to your wallet via{" "}
        <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
          GET /api/account/*
        </code>
        .
      </p>
      <ul className="mb-10 space-y-2 text-neutral-700">
        <li>
          <strong>Discovery:</strong>{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
            GET /.well-known/x402
          </code>
        </li>
        <li>
          <strong>OpenAPI:</strong>{" "}
          <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
            GET /openapi.json
          </code>
        </li>
        <li>
          <strong>Agent guidance:</strong>{" "}
          <Link href="/llms.txt" className="text-[var(--accent)] underline">
            GET /llms.txt
          </Link>
        </li>
      </ul>
      <p className="text-sm text-neutral-500">
        Cold outbound to new recipients: $0.50/recipient (50/day cap), text-only
        opener; cold-only sends pay max(cold fee, surge slot price). Warm
        follow-ups use surge pricing ($0.05–$1.25). All messages
        send from +12052438809 — not configurable via the API.
      </p>
    </main>
  );
}
