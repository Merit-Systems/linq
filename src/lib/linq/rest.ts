import { env } from "@/env";

const BASE = "https://api.linqapp.com/api/partner/v3";

async function linqFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.LINQ_API_KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw Object.assign(new Error(text || res.statusText), {
      status: res.status,
    });
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function createPaymentRequest(body: unknown) {
  return linqFetch("/payment_requests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listPaymentRequests(query?: Record<string, string | string[] | undefined>) {
  const flat: Record<string, string> = {};
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined) continue;
      flat[k] = Array.isArray(v) ? v.join(",") : v;
    }
  }
  const params = Object.keys(flat).length ? `?${new URLSearchParams(flat)}` : "";
  return linqFetch(`/payment_requests${params}`);
}

export async function retrievePaymentRequest(id: string) {
  return linqFetch(`/payment_requests/${encodeURIComponent(id)}`);
}

export async function cancelPaymentRequest(id: string) {
  return linqFetch(`/payment_requests/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
  });
}
