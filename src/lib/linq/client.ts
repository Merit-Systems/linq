import LinqAPIV3 from "@linqapp/sdk";
import { env } from "@/env";

let client: LinqAPIV3 | null = null;

function getClient(): LinqAPIV3 {
  if (!client) {
    client = new LinqAPIV3({
      apiKey: env.LINQ_API_KEY,
      webhookSecret: env.LINQ_WEBHOOK_SECRET ?? null,
    });
  }
  return client;
}

export const linq: LinqAPIV3 = new Proxy({} as LinqAPIV3, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getClient(), prop, receiver);
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
});

export type { LinqAPIV3 };
