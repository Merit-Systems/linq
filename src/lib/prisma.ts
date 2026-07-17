import { PrismaClient } from "../../generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";
import { neonConfig } from "@neondatabase/serverless";

function isNeonDatabaseUrl(connectionString: string): boolean {
  return (
    connectionString.includes("neon.tech") ||
    connectionString.includes(".neon.")
  );
}

function createPrismaClient(connectionString: string) {
  const useNeon = isNeonDatabaseUrl(connectionString);

  if (useNeon) {
    neonConfig.poolQueryViaFetch = true;
  }

  const adapter = useNeon
    ? new PrismaNeon({ connectionString })
    : new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
}

let client: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (client) return client;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  client = createPrismaClient(connectionString);
  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getPrismaClient(), prop, receiver);
    return typeof value === "function" ? value.bind(getPrismaClient()) : value;
  },
});
