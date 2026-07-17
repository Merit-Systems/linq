import { handleLinqWebhook } from "@/lib/webhooks/linq/handler";

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return handleLinqWebhook(rawBody, headers);
}
