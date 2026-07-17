#!/usr/bin/env node
/**
 * Audits StableLinq route coverage against @linqapp/sdk methods listed in api.md.
 *
 * Parses src/lib/routes.registry.ts and app/api route handlers for
 * registered handlers.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/** SDK methods from https://github.com/linq-team/linq-node/blob/main/api.md */
const EXPECTED_SDK_METHODS: Array<{
  method: string;
  routeImportSuffix: string;
}> = [
  { method: "client.chats.create", routeImportSuffix: "chats/create" },
  { method: "client.chats.listChats", routeImportSuffix: "chats/list" },
  { method: "client.chats.retrieve", routeImportSuffix: "chats/retrieve" },
  { method: "client.chats.update", routeImportSuffix: "chats/update" },
  { method: "client.chats.markAsRead", routeImportSuffix: "chats/mark-as-read" },
  { method: "client.chats.leaveChat", routeImportSuffix: "chats/leave" },
  {
    method: "client.chats.shareContactCard",
    routeImportSuffix: "chats/share-contact-card",
  },
  {
    method: "client.chats.sendVoicememo",
    routeImportSuffix: "chats/send-voicememo",
  },
  {
    method: "client.chats.participants.add",
    routeImportSuffix: "chats/participants/add",
  },
  {
    method: "client.chats.participants.remove",
    routeImportSuffix: "chats/participants/remove",
  },
  { method: "client.chats.typing.start", routeImportSuffix: "chats/typing/start" },
  { method: "client.chats.typing.stop", routeImportSuffix: "chats/typing/stop" },
  {
    method: "client.chats.messages.send",
    routeImportSuffix: "chats/messages/send",
  },
  {
    method: "client.chats.messages.list",
    routeImportSuffix: "chats/messages/list",
  },
  {
    method: "client.chats.location.request",
    routeImportSuffix: "chats/location/request",
  },
  {
    method: "client.chats.location.retrieve",
    routeImportSuffix: "chats/location/retrieve",
  },
  { method: "client.messages.create", routeImportSuffix: "messages/create" },
  {
    method: "client.messages.listMessagesThread",
    routeImportSuffix: "messages/list-thread",
  },
  { method: "client.messages.retrieve", routeImportSuffix: "messages/retrieve" },
  { method: "client.messages.delete", routeImportSuffix: "messages/delete" },
  { method: "client.messages.addReaction", routeImportSuffix: "messages/add-reaction" },
  { method: "client.messages.update", routeImportSuffix: "messages/update" },
  {
    method: "client.messages.updateAppCard",
    routeImportSuffix: "messages/update-app-card",
  },
  { method: "client.attachments.create", routeImportSuffix: "attachments/create" },
  {
    method: "client.attachments.retrieve",
    routeImportSuffix: "attachments/retrieve",
  },
  { method: "client.attachments.delete", routeImportSuffix: "attachments/delete" },
  { method: "client.phonenumbers.list", routeImportSuffix: "phonenumbers/list" },
  { method: "client.phoneNumbers.list", routeImportSuffix: "phone-numbers/list" },
  {
    method: "client.phoneNumbers.update",
    routeImportSuffix: "phone-numbers/update",
  },
  {
    method: "client.availableNumber.retrieve",
    routeImportSuffix: "available-number/retrieve",
  },
  { method: "client.webhookEvents.list", routeImportSuffix: "webhook-events/list" },
  {
    method: "client.webhookSubscriptions.create",
    routeImportSuffix: "webhook-subscriptions/create",
  },
  {
    method: "client.webhookSubscriptions.list",
    routeImportSuffix: "webhook-subscriptions/list",
  },
  {
    method: "client.webhookSubscriptions.retrieve",
    routeImportSuffix: "webhook-subscriptions/retrieve",
  },
  {
    method: "client.webhookSubscriptions.update",
    routeImportSuffix: "webhook-subscriptions/update",
  },
  {
    method: "client.webhookSubscriptions.delete",
    routeImportSuffix: "webhook-subscriptions/delete",
  },
  {
    method: "client.capability.checkIMessage",
    routeImportSuffix: "capability/check-imessage",
  },
  { method: "client.capability.checkRCS", routeImportSuffix: "capability/check-rcs" },
  { method: "client.contactCard.retrieve", routeImportSuffix: "contact-card/retrieve" },
  { method: "client.contactCard.create", routeImportSuffix: "contact-card/create" },
  { method: "client.contactCard.update", routeImportSuffix: "contact-card/update" },
];

/** REST-only endpoints not yet in @linqapp/sdk@0.28.2 */
const EXPECTED_REST_GAP_METHODS: Array<{
  method: string;
  routeImportSuffix: string;
}> = [
  { method: "POST /v3/payment_requests", routeImportSuffix: "payment-requests/create" },
  { method: "GET /v3/payment_requests", routeImportSuffix: "payment-requests/list" },
  {
    method: "GET /v3/payment_requests/{id}",
    routeImportSuffix: "payment-requests/retrieve",
  },
  {
    method: "POST /v3/payment_requests/{id}/cancel",
    routeImportSuffix: "payment-requests/cancel",
  },
];

function suffixToHandlerName(suffix: string): string {
  return `handle${suffix
    .split("/")
    .map((s) =>
      s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase()),
    )
    .join("")}`;
}

function readRegistry(): string {
  const registryPath = join(ROOT, "src/lib/routes.registry.ts");
  if (!existsSync(registryPath)) {
    return "";
  }
  return readFileSync(registryPath, "utf8");
}

function findHandlerFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) findHandlerFiles(full, acc);
    else if (entry === "handlers.ts" && full.includes("_shared")) acc.push(full);
  }
  return acc;
}

function readAllHandlersSource(): string {
  const files = findHandlerFiles(join(ROOT, "src/app/api"));
  return files.map((f) => readFileSync(f, "utf8")).join("\n");
}

function extractRegistryImports(source: string): Set<string> {
  const imports = new Set<string>();
  const importPattern = /import\s+["'](@\/app\/api\/[^"']+)["'];?/g;
  let match: RegExpExecArray | null;
  while ((match = importPattern.exec(source)) !== null) {
    imports.add(match[1]!);
  }
  return imports;
}

function main(): void {
  const registry = readRegistry();
  const registryImports = extractRegistryImports(registry);
  const handlersSource = readAllHandlersSource();

  const allExpected = [...EXPECTED_SDK_METHODS, ...EXPECTED_REST_GAP_METHODS];
  const missing = allExpected.filter(({ routeImportSuffix }) => {
    const handler = suffixToHandlerName(routeImportSuffix);
    return !handlersSource.includes(`function ${handler}(`);
  });

  console.log("StableLinq SDK coverage audit");
  console.log("=============================");
  console.log(`Expected SDK methods: ${EXPECTED_SDK_METHODS.length}`);
  console.log(`Expected REST gap endpoints: ${EXPECTED_REST_GAP_METHODS.length}`);
  console.log(`Registry imports: ${registryImports.size}`);

  for (const discoveryFile of [
    "src/app/openapi.json/route.ts",
    "src/app/.well-known/x402/route.ts",
    "src/app/llms.txt/route.ts",
  ]) {
    const src = readFileSync(join(ROOT, discoveryFile), "utf8");
    if (!src.includes('@/lib/routes.registry')) {
      console.log(`\nMissing routes.registry import in ${discoveryFile}`);
      process.exitCode = 1;
    }
  }

  if (missing.length > 0) {
    console.log("\nMissing handlers:");
    for (const { method, routeImportSuffix } of missing) {
      console.log(`  ✗ ${method} → ${suffixToHandlerName(routeImportSuffix)}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("\nAll expected SDK methods and REST gap endpoints are registered.");
}

main();
