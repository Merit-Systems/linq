import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const appUrlSchema = z
  .string()
  .default(
    process.env.BASE_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://stablelinq.dev"),
  )
  .pipe(z.url());

export const env = createEnv({
  server: {
    BASE_URL: appUrlSchema,
    LINQ_API_KEY: z.string().min(1),
    PAYEE_ADDRESS: z.string().min(1),
    CDP_API_KEY_ID: z.string().min(1),
    CDP_API_KEY_SECRET: z.string().min(1),
    MPP_SECRET_KEY: z.string().optional(),
    MPP_CURRENCY: z.string().optional(),
    TEMPO_RPC_URL: z.string().url().optional(),
    TELEM_CLICKHOUSE_URL: z.string().url().default("http://localhost:8123"),
    TELEM_CLICKHOUSE_DATABASE: z.string().default("default"),
    TELEM_CLICKHOUSE_USERNAME: z.string().default("default"),
    TELEM_CLICKHOUSE_PASSWORD: z.string().default(""),
    STABLELINQ_BASE_PRICE_USD: z.coerce.number().default(0.05),
    STABLELINQ_LINQ_PACKAGE_USD: z.coerce.number().default(289),
    STABLELINQ_LINQ_PACKAGE_MESSAGES: z.coerce.number().default(7000),
    STABLELINQ_DAILY_MESSAGE_CAP: z.coerce.number().default(6000),
    STABLELINQ_FLAT_PRICE_USD: z.coerce.number().default(0.02),
    KV_REST_API_URL: z.string().url(),
    KV_REST_API_TOKEN: z.string().min(1),
    DATABASE_URL: z.string().url(),
    DISCORD_WEBHOOK_URL: z.string().url().optional(),
    LINQ_WEBHOOK_SECRET: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    SKIP_ENV_VALIDATION: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    BASE_URL: process.env.BASE_URL,
    LINQ_API_KEY: process.env.LINQ_API_KEY,
    PAYEE_ADDRESS: process.env.PAYEE_ADDRESS,
    CDP_API_KEY_ID: process.env.CDP_API_KEY_ID,
    CDP_API_KEY_SECRET: process.env.CDP_API_KEY_SECRET,
    MPP_SECRET_KEY: process.env.MPP_SECRET_KEY,
    MPP_CURRENCY: process.env.MPP_CURRENCY,
    TEMPO_RPC_URL: process.env.TEMPO_RPC_URL,
    TELEM_CLICKHOUSE_URL: process.env.TELEM_CLICKHOUSE_URL,
    TELEM_CLICKHOUSE_DATABASE: process.env.TELEM_CLICKHOUSE_DATABASE,
    TELEM_CLICKHOUSE_USERNAME: process.env.TELEM_CLICKHOUSE_USERNAME,
    TELEM_CLICKHOUSE_PASSWORD: process.env.TELEM_CLICKHOUSE_PASSWORD,
    STABLELINQ_BASE_PRICE_USD: process.env.STABLELINQ_BASE_PRICE_USD,
    STABLELINQ_LINQ_PACKAGE_USD: process.env.STABLELINQ_LINQ_PACKAGE_USD,
    STABLELINQ_LINQ_PACKAGE_MESSAGES:
      process.env.STABLELINQ_LINQ_PACKAGE_MESSAGES,
    STABLELINQ_DAILY_MESSAGE_CAP: process.env.STABLELINQ_DAILY_MESSAGE_CAP,
    STABLELINQ_FLAT_PRICE_USD: process.env.STABLELINQ_FLAT_PRICE_USD,
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
    LINQ_WEBHOOK_SECRET: process.env.LINQ_WEBHOOK_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    SKIP_ENV_VALIDATION: process.env.SKIP_ENV_VALIDATION,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
