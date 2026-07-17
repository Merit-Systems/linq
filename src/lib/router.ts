import { createRouter, type PaidOptions } from "@agentcash/router";
import { createTelemetryPlugin } from "@agentcash/telemetry/plugin";
import { LLMS_TXT } from "@/lib/llms-txt";
import { env } from "@/env";

function resolveBaseUrl(): string {
  if (env.BASE_URL) return env.BASE_URL;
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (host) return `https://${host}`;
  return "https://stablelinq.dev";
}

const payeeAddress =
  env.PAYEE_ADDRESS || "0x0000000000000000000000000000000000000001";

const SOLANA_MAINNET = "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp";
const x402Accepts = [
  { network: "eip155:8453", payTo: payeeAddress },
  ...(env.SOLANA_PAYEE_ADDRESS
    ? [{ network: SOLANA_MAINNET, payTo: env.SOLANA_PAYEE_ADDRESS }]
    : []),
];

if (!process.env.NEXT_PUBLIC_BASE_URL) {
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (host) {
    process.env.NEXT_PUBLIC_BASE_URL = `https://${host}`;
  }
}

if (env.MPP_SECRET_KEY && !env.MPP_CURRENCY) {
  throw new Error("MPP_CURRENCY is required when MPP_SECRET_KEY is set.");
}

const hasMpp = !!(env.MPP_SECRET_KEY && env.MPP_CURRENCY);
const protocols: ("x402" | "mpp")[] = hasMpp ? ["x402", "mpp"] : ["x402"];

const mppConfig = hasMpp
  ? {
      secretKey: env.MPP_SECRET_KEY!,
      currency: env.MPP_CURRENCY!,
      recipient: payeeAddress,
      rpcUrl: env.TEMPO_RPC_URL,
    }
  : undefined;

export const paidOpts = (extra?: Partial<PaidOptions>): PaidOptions => ({
  protocols,
  ...extra,
});

export const router = createRouter({
  baseUrl: resolveBaseUrl(),
  protocols,
  x402: {
    ...(env.SOLANA_FACILITATOR_URL && {
      facilitators: { solana: env.SOLANA_FACILITATOR_URL },
    }),
    accepts: x402Accepts,
  },
  discovery: {
    title: "StableLinq",
    version: "1.0.0",
    description:
      "Linq Partner API v3 — iMessage, RCS, and SMS. Pay with USDC. No API keys. No accounts.",
    contact: {
      name: "Merit Systems",
      url: resolveBaseUrl(),
      email: "lucas@merit.systems",
    },
    guidance: LLMS_TXT,
  },
  mpp: mppConfig,
  plugin: createTelemetryPlugin({
    clickhouse: {
      url: env.TELEM_CLICKHOUSE_URL,
      database: env.TELEM_CLICKHOUSE_DATABASE,
      username: env.TELEM_CLICKHOUSE_USERNAME,
      password: env.TELEM_CLICKHOUSE_PASSWORD,
    },
  }),
});
