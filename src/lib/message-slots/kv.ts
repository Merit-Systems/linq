import { Redis } from "@upstash/redis";
import { env } from "@/env";

export const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

export function dailyCounterKey(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `stablelinq:daily:${date}`;
}

export function outboundFirstKey(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `stablelinq:outbound-first:${date}`;
}

export function sendRecordKey(id: string): string {
  return `stablelinq:send:${id}`;
}

export function sendIndexKey(date?: string): string {
  const d = date ?? new Date().toISOString().slice(0, 10);
  return `stablelinq:send-index:${d}`;
}

export function webhookEventKey(eventId: string): string {
  return `stablelinq:webhook-event:${eventId}`;
}

export function secondsUntilMidnightUtc(): number {
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.ceil((midnight.getTime() - Date.now()) / 1000);
}
