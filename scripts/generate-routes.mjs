#!/usr/bin/env node
/**
 * Generates route modules (index.ts, schema.ts, handler.ts) and app/api re-exports.
 */
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Not exposed to agents — shared line, ops-only, or replaced by POST /messages. */
const REMOVED_AGENT_WRITE_SLUGS = new Set([
  "chats/create",
  "chats/update",
  "chats/mark-as-read",
  "chats/leave",
  "chats/share-contact-card",
  "chats/participants/add",
  "chats/participants/remove",
  "chats/typing/start",
  "chats/typing/stop",
  "chats/location/request",
]);

function isAgentRoute(def) {
  return (
    def.auth !== "siwx" &&
    !def.opsOnly &&
    !REMOVED_AGENT_WRITE_SLUGS.has(def.slug)
  );
}

function isOpsRoute(def) {
  return def.opsOnly === true;
}

/** @type {Array<RouteDef>} */
const ROUTES = [
  {
    slug: "capability/check-imessage",
    apiPath: "capability/check-imessage",
    method: "POST",
    auth: "paid-flat",
    sdkCall: "linq.capability.checkIMessage(body)",
    bodyImport: "capabilityCheckIMessageParamsSchema",
    bodyFrom: "params/capability-check-imessage-params",
    outputImport: "handleCheckResponseSchema",
    outputFrom: "responses/capability-responses",
    desc: "Check whether handles support iMessage.",
  },
  {
    slug: "capability/check-rcs",
    apiPath: "capability/check-rcs",
    method: "POST",
    auth: "paid-flat",
    sdkCall: "linq.capability.checkRCS(body)",
    bodyImport: "capabilityCheckRCSParamsSchema",
    bodyFrom: "params/capability-check-rcs-params",
    outputImport: "handleCheckResponseSchema",
    outputFrom: "responses/capability-responses",
    desc: "Check whether handles support RCS.",
  },
  {
    slug: "chats/create",
    apiPath: "chats",
    method: "POST",
    auth: "paid-message-outbound",
    sdkCall: "linq.chats.create(body)",
    bodyImport: "chatCreateAgentParamsSchema",
    bodyFrom: "params/chat-create-params",
    outputImport: "chatCreateResponseSchema",
    outputFrom: "responses/chat-responses",
    desc: "Create a chat and send the initial message. First message must be text-only (no links/media/URLs). Outbound-first pricing applies per new recipient (50/day cap).",
    messagePricing: "outbound",
    injectFrom: true,
    markWarm: true,
    recordSent: true,
  },
  {
    slug: "chats/list",
    apiPath: "chats",
    method: "GET",
    auth: "siwx",
    sdkCall: "linq.chats.listChats(query ?? undefined)",
    queryImport: "chatListChatsParamsSchema",
    queryFrom: "params/chat-list-chats-params",
    outputImport: "chatSchema",
    outputFrom: "responses/chat-responses",
    desc: "List chats with optional from/to filters and pagination.",
  },
  {
    slug: "chats/retrieve",
    apiPath: "chats/{chatId}",
    method: "GET",
    auth: "siwx",
    pathParam: "chatId",
    sdkCall: "linq.chats.retrieve(chatId)",
    outputImport: "chatSchema",
    outputFrom: "responses/chat-responses",
    desc: "Retrieve a chat by ID.",
  },
  {
    slug: "chats/update",
    apiPath: "chats/{chatId}",
    method: "PUT",
    auth: "paid-flat",
    pathParam: "chatId",
    sdkCall: "linq.chats.update(chatId, body)",
    bodyImport: "chatUpdateParamsSchema",
    bodyFrom: "params/chat-update-params",
    outputImport: "chatUpdateResponseSchema",
    outputFrom: "responses/chat-responses",
    desc: "Update chat display name or group icon.",
  },
  {
    slug: "chats/mark-as-read",
    apiPath: "chats/{chatId}/read",
    method: "POST",
    auth: "paid-flat",
    pathParam: "chatId",
    sdkCall: "linq.chats.markAsRead(chatId)",
    outputImport: "emptyObjectSchema",
    outputFrom: "common",
    desc: "Mark all messages in a chat as read.",
  },
  {
    slug: "chats/leave",
    apiPath: "chats/{chatId}/leave",
    method: "POST",
    auth: "paid-flat",
    pathParam: "chatId",
    sdkCall: "linq.chats.leaveChat(chatId)",
    outputImport: "chatLeaveChatResponseSchema",
    outputFrom: "responses/chat-responses",
    desc: "Leave a group chat.",
  },
  {
    slug: "chats/share-contact-card",
    apiPath: "chats/{chatId}/share-contact-card",
    method: "POST",
    auth: "paid-flat",
    pathParam: "chatId",
    sdkCall: "linq.chats.shareContactCard(chatId)",
    outputImport: "emptyObjectSchema",
    outputFrom: "common",
    desc: "Share contact card with chat participants.",
  },
  {
    slug: "chats/send-voicememo",
    apiPath: "chats/{chatId}/voicememo",
    method: "POST",
    auth: "paid-message-followup",
    pathParam: "chatId",
    sdkCall: "linq.chats.sendVoicememo(chatId, body)",
    bodyImport: "chatSendVoicememoParamsSchema",
    bodyFrom: "params/chat-send-voicememo-params",
    outputImport: "chatSendVoicememoResponseSchema",
    outputFrom: "responses/chat-responses",
    desc: "Send an iMessage voice memo to a chat.",
    messagePricing: "followup",
    coldValidateInHandler: true,
    recordSent: true,
  },
  {
    slug: "chats/participants/add",
    apiPath: "chats/{chatId}/participants",
    method: "POST",
    auth: "paid-flat",
    pathParam: "chatId",
    sdkCall: "linq.chats.participants.add(chatId, body)",
    bodyImport: "participantAddParamsSchema",
    bodyFrom: "params/participant-add-params",
    outputImport: "participantAddResponseSchema",
    outputFrom: "responses/participant-responses",
    desc: "Add participants to a group chat.",
  },
  {
    slug: "chats/participants/remove",
    apiPath: "chats/{chatId}/participants",
    method: "DELETE",
    auth: "paid-flat",
    pathParam: "chatId",
    sdkCall: "linq.chats.participants.remove(chatId, body)",
    bodyImport: "participantRemoveParamsSchema",
    bodyFrom: "params/participant-remove-params",
    outputImport: "participantRemoveResponseSchema",
    outputFrom: "responses/participant-responses",
    desc: "Remove participants from a group chat.",
  },
  {
    slug: "chats/typing/start",
    apiPath: "chats/{chatId}/typing",
    method: "POST",
    auth: "paid-flat",
    pathParam: "chatId",
    sdkCall: "linq.chats.typing.start(chatId)",
    outputImport: "emptyObjectSchema",
    outputFrom: "common",
    desc: "Start typing indicator.",
  },
  {
    slug: "chats/typing/stop",
    apiPath: "chats/{chatId}/typing",
    method: "DELETE",
    auth: "paid-flat",
    pathParam: "chatId",
    sdkCall: "linq.chats.typing.stop(chatId)",
    outputImport: "emptyObjectSchema",
    outputFrom: "common",
    desc: "Stop typing indicator.",
  },
  {
    slug: "chats/location/request",
    apiPath: "chats/{chatId}/location/request",
    method: "POST",
    auth: "paid-flat",
    pathParam: "chatId",
    sdkCall: "linq.chats.location.request(chatId)",
    outputImport: "locationRequestResponseSchema",
    outputFrom: "responses/location-responses",
    desc: "Request location from chat participant.",
  },
  {
    slug: "chats/location/retrieve",
    apiPath: "chats/{chatId}/location",
    method: "GET",
    auth: "siwx",
    pathParam: "chatId",
    sdkCall: "linq.chats.location.retrieve(chatId)",
    outputImport: "getChatLocationResponseSchema",
    outputFrom: "responses/location-responses",
    desc: "Get shared location for a chat.",
  },
  {
    slug: "chats/messages/send",
    apiPath: "chats/{chatId}/messages",
    method: "POST",
    auth: "paid-message-followup",
    pathParam: "chatId",
    sdkCall: "linq.chats.messages.send(chatId, body)",
    bodyImport: "messageSendParamsSchema",
    bodyFrom: "params/message-send-params",
    outputImport: "messageSendResponseSchema",
    outputFrom: "responses/chat-responses",
    desc: "Send a message to an existing chat.",
    messagePricing: "followup",
    recordSent: true,
  },
  {
    slug: "chats/messages/list",
    apiPath: "chats/{chatId}/messages",
    method: "GET",
    auth: "siwx",
    pathParam: "chatId",
    sdkCall: "linq.chats.messages.list(chatId, query ?? undefined)",
    queryImport: "messageListParamsSchema",
    queryFrom: "params/message-list-params",
    outputImport: "messageSchema",
    outputFrom: "responses/message-responses",
    desc: "List messages in a chat.",
  },
  {
    slug: "messages/create",
    apiPath: "messages",
    method: "POST",
    auth: "paid-message-outbound",
    sdkCall: "linq.messages.create(body)",
    bodyImport: "messageCreateParamsSchema",
    bodyFrom: "params/message-create-params",
    outputImport: "messageCreateResponseSchema",
    outputFrom: "responses/message-responses",
    desc: "Send a message to one or more recipients (cold start or warm). Reuses an existing chat when possible. First contact to a new recipient must be text-only (no links/media/URLs). Outbound-first pricing applies per new recipient (50/day cap).",
    messagePricing: "outbound",
    injectFrom: true,
    markWarm: true,
    recordSent: true,
  },
  {
    slug: "messages/retrieve",
    apiPath: "messages/{messageId}",
    method: "GET",
    auth: "siwx",
    pathParam: "messageId",
    sdkCall: "linq.messages.retrieve(messageId)",
    outputImport: "messageSchema",
    outputFrom: "responses/message-responses",
    desc: "Retrieve a message by ID.",
  },
  {
    slug: "messages/delete",
    apiPath: "messages/{messageId}",
    method: "DELETE",
    auth: "paid-flat",
    pathParam: "messageId",
    sdkCall: "linq.messages.delete(messageId)",
    outputImport: "emptyObjectSchema",
    outputFrom: "common",
    desc: "Delete a message.",
    requireMessageOwnership: true,
  },
  {
    slug: "messages/update",
    apiPath: "messages/{messageId}",
    method: "PATCH",
    auth: "paid-flat",
    pathParam: "messageId",
    sdkCall: "linq.messages.update(messageId, body)",
    bodyImport: "messageUpdateParamsSchema",
    bodyFrom: "params/message-update-params",
    outputImport: "messageSchema",
    outputFrom: "responses/message-responses",
    desc: "Edit a message.",
    requireMessageOwnership: true,
  },
  {
    slug: "messages/update-app-card",
    apiPath: "messages/{messageId}/update",
    method: "POST",
    auth: "paid-flat",
    pathParam: "messageId",
    sdkCall: "linq.messages.updateAppCard(messageId, body)",
    bodyImport: "messageUpdateAppCardParamsSchema",
    bodyFrom: "params/message-update-app-card-params",
    outputImport: "messageUpdateAppCardResponseSchema",
    outputFrom: "responses/message-responses",
    desc: "Update an iMessage app card.",
    requireMessageOwnership: true,
  },
  {
    slug: "messages/add-reaction",
    apiPath: "messages/{messageId}/reactions",
    method: "POST",
    auth: "paid-flat",
    pathParam: "messageId",
    sdkCall: "linq.messages.addReaction(messageId, body)",
    bodyImport: "messageAddReactionParamsSchema",
    bodyFrom: "params/message-add-reaction-params",
    outputImport: "messageAddReactionResponseSchema",
    outputFrom: "responses/message-responses",
    desc: "Add a reaction to a message.",
    requireMessageOwnership: true,
  },
  {
    slug: "messages/list-thread",
    apiPath: "messages/{messageId}/thread",
    method: "GET",
    auth: "siwx",
    pathParam: "messageId",
    sdkCall: "linq.messages.listMessagesThread(messageId, query ?? undefined)",
    queryImport: "messageListMessagesThreadParamsSchema",
    queryFrom: "params/message-list-messages-thread-params",
    outputImport: "messageSchema",
    outputFrom: "responses/message-responses",
    desc: "List messages in a thread.",
  },
  {
    slug: "attachments/create",
    apiPath: "attachments",
    method: "POST",
    auth: "paid-flat",
    sdkCall: "linq.attachments.create(body)",
    bodyImport: "attachmentCreateParamsSchema",
    bodyFrom: "params/attachment-create-params",
    outputImport: "attachmentCreateResponseSchema",
    outputFrom: "responses/attachment-responses",
    desc: "Pre-upload attachment — returns presigned upload URL.",
  },
  {
    slug: "attachments/delete",
    apiPath: "attachments/{attachmentId}",
    method: "DELETE",
    auth: "paid-flat",
    pathParam: "attachmentId",
    sdkCall: "linq.attachments.delete(attachmentId)",
    outputImport: "emptyObjectSchema",
    outputFrom: "common",
    desc: "Delete an attachment.",
  },
  {
    slug: "contact-card/retrieve",
    apiPath: "contact-card",
    method: "GET",
    auth: "siwx",
    sdkCall: "linq.contactCard.retrieve(query ?? undefined)",
    queryImport: "contactCardRetrieveParamsSchema",
    queryFrom: "params/contact-card-retrieve-params",
    outputImport: "contactCardRetrieveResponseSchema",
    outputFrom: "responses/contact-card-responses",
    desc: "Retrieve contact card configuration.",
  },
  {
    slug: "contact-card/create",
    apiPath: "contact-card",
    method: "POST",
    auth: "paid-flat",
    sdkCall: "linq.contactCard.create(body)",
    bodyImport: "contactCardCreateParamsSchema",
    bodyFrom: "params/contact-card-create-params",
    outputImport: "setContactCardSchema",
    outputFrom: "responses/contact-card-responses",
    desc: "Create contact card configuration.",
    opsOnly: true,
  },
  {
    slug: "contact-card/update",
    apiPath: "contact-card",
    method: "PATCH",
    auth: "paid-flat",
    sdkCall: "linq.contactCard.update(body)",
    bodyImport: "contactCardUpdateParamsSchema",
    bodyFrom: "params/contact-card-update-params",
    outputImport: "setContactCardSchema",
    outputFrom: "responses/contact-card-responses",
    desc: "Update contact card configuration.",
    opsOnly: true,
  },
  {
    slug: "phone-numbers/list",
    apiPath: "phone-numbers",
    method: "GET",
    auth: "siwx",
    sdkCall: "linq.phoneNumbers.list()",
    outputImport: "phoneNumberListResponseSchema",
    outputFrom: "responses/phone-number-responses",
    desc: "List phone numbers.",
  },
  {
    slug: "phone-numbers/update",
    apiPath: "phone-numbers/{phoneNumberId}",
    method: "PUT",
    auth: "paid-flat",
    pathParam: "phoneNumberId",
    sdkCall: "linq.phoneNumbers.update(phoneNumberId, body)",
    bodyImport: "phoneNumberUpdateParamsSchema",
    bodyFrom: "params/phone-number-update-params",
    outputImport: "phoneNumberUpdateResponseSchema",
    outputFrom: "responses/phone-number-responses",
    desc: "Update phone number settings.",
    opsOnly: true,
  },
  {
    slug: "phonenumbers/list",
    apiPath: "phonenumbers",
    method: "GET",
    auth: "siwx",
    sdkCall: "linq.phonenumbers.list()",
    outputImport: "phonenumberListResponseSchema",
    outputFrom: "responses/phone-number-responses",
    desc: "List phonenumbers (alternate API).",
  },
  {
    slug: "available-number/retrieve",
    apiPath: "available-number",
    method: "GET",
    auth: "paid-flat",
    sdkCall: "linq.availableNumber.retrieve(query ?? undefined)",
    queryImport: "availableNumberRetrieveParamsSchema",
    queryFrom: "params/available-number-retrieve-params",
    outputImport: "availableNumberRetrieveResponseSchema",
    outputFrom: "responses/available-number-responses",
    desc: "Find an available phone number.",
    opsOnly: true,
  },
  {
    slug: "webhook-events/list",
    apiPath: "webhook-events",
    method: "GET",
    auth: "siwx",
    sdkCall: "linq.webhookEvents.list()",
    outputImport: "webhookEventListResponseSchema",
    outputFrom: "responses/webhook-responses",
    desc: "List available webhook event types.",
  },
  {
    slug: "webhook-subscriptions/create",
    apiPath: "webhook-subscriptions",
    method: "POST",
    auth: "paid-flat",
    sdkCall: "linq.webhookSubscriptions.create(body)",
    bodyImport: "webhookSubscriptionCreateParamsSchema",
    bodyFrom: "params/webhook-subscription-create-params",
    outputImport: "webhookSubscriptionCreateResponseSchema",
    outputFrom: "responses/webhook-responses",
    desc: "Create a webhook subscription.",
    opsOnly: true,
  },
  {
    slug: "webhook-subscriptions/list",
    apiPath: "webhook-subscriptions",
    method: "GET",
    auth: "siwx",
    sdkCall: "linq.webhookSubscriptions.list()",
    outputImport: "webhookSubscriptionListResponseSchema",
    outputFrom: "responses/webhook-responses",
    desc: "List webhook subscriptions.",
  },
  {
    slug: "webhook-subscriptions/retrieve",
    apiPath: "webhook-subscriptions/{subscriptionId}",
    method: "GET",
    auth: "siwx",
    pathParam: "subscriptionId",
    sdkCall: "linq.webhookSubscriptions.retrieve(subscriptionId)",
    outputImport: "webhookSubscriptionSchema",
    outputFrom: "responses/webhook-responses",
    desc: "Retrieve a webhook subscription.",
  },
  {
    slug: "webhook-subscriptions/update",
    apiPath: "webhook-subscriptions/{subscriptionId}",
    method: "PUT",
    auth: "paid-flat",
    pathParam: "subscriptionId",
    sdkCall: "linq.webhookSubscriptions.update(subscriptionId, body)",
    bodyImport: "webhookSubscriptionUpdateParamsSchema",
    bodyFrom: "params/webhook-subscription-update-params",
    outputImport: "webhookSubscriptionSchema",
    outputFrom: "responses/webhook-responses",
    desc: "Update a webhook subscription.",
    opsOnly: true,
  },
  {
    slug: "webhook-subscriptions/delete",
    apiPath: "webhook-subscriptions/{subscriptionId}",
    method: "DELETE",
    auth: "paid-flat",
    pathParam: "subscriptionId",
    sdkCall: "linq.webhookSubscriptions.delete(subscriptionId)",
    outputImport: "emptyObjectSchema",
    outputFrom: "common",
    desc: "Delete a webhook subscription.",
    opsOnly: true,
  },
];

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function schemaImportPath(from) {
  return `@/lib/schemas/linq/${from}`;
}

function handlerName(def) {
  return `handle${def.slug
    .split("/")
    .map((s) =>
      s.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase()),
    )
    .join("")}`;
}

function appDirFor(def) {
  return join(ROOT, "src/app/api", def.apiPath.replace(/\{([^}]+)\}/g, "[$1]"));
}

function registryImportPath(appDir) {
  const rel = appDir.replace(join(ROOT, "src/app/api/"), "");
  return `@/app/api/${rel}/route`;
}

function toRouterPath(apiPath) {
  return apiPath.replace(/\{([^}]+)\}/g, ":$1");
}

function collectHandlerImports(defs) {
  const imports = new Set([
    `import { NextResponse } from "next/server";`,
    `import { mapLinqError } from "@/lib/linq/errors";`,
  ]);

  const needsLinq = defs.some((d) => !d.rest);
  const needsRest = defs.some((d) => d.rest);
  if (needsLinq) imports.add(`import { linq } from "@/lib/linq/client";`);
  if (needsRest) {
    for (const def of defs.filter((d) => d.rest)) {
      imports.add(
        `import { ${def.sdkCall.replace(/\(.*/, "")} } from "@/lib/linq/rest";`,
      );
    }
  }

  if (defs.some((d) => d.messagePricing === "outbound")) {
    imports.add(
      `import { reserveMessageSendSlots, markColdRecipientsWarm } from "@/lib/routing/_shared/message-pricing";`,
    );
  }
  if (defs.some((d) => d.messagePricing === "followup")) {
    imports.add(
      `import { reserveFollowUpMessageSlot } from "@/lib/routing/_shared/message-pricing";`,
    );
  }

  if (defs.some((d) => d.injectFrom)) {
    imports.add(
      `import { injectFromLine } from "@/lib/routing/_shared/from-line";`,
    );
  }

  if (defs.some((d) => d.coldValidateInHandler)) {
    imports.add(
      `import { validateColdOutbound } from "@/lib/routing/_shared/first-message-validate";`,
    );
  }

  if (
    defs.some(
      (d) =>
        Boolean(d.pathParam) ||
        Boolean(d.apiPath.match(/\{([^}]+)\}/)?.[1]) ||
        d.requireMessageOwnership,
    )
  ) {
    imports.add(
      `import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";`,
    );
  }

  if (defs.some((d) => d.recordSent)) {
    imports.add(
      `import { recordSentMessage } from "@/lib/stablelinq/sent-messages/repository";`,
    );
  }

  if (defs.some((d) => d.requireMessageOwnership)) {
    imports.add(
      `import { assertWalletOwnsMessage } from "@/lib/stablelinq/sent-messages/repository";`,
    );
  }

  if (defs.some((d) => d.opsOnly)) {
    imports.add(`import { assertOpsWallet } from "@/lib/stablelinq/ops-auth";`);
  }

  return imports;
}

function handlerCtxBindings(def, pathParam) {
  const fields = new Set();
  if (pathParam || def.coldValidateInHandler || def.messagePricing === "outbound") {
    fields.add("request");
  }
  if (def.bodyImport || def.coldValidateInHandler || def.messagePricing === "outbound") {
    fields.add("body");
  }
  if (def.queryImport) fields.add("query");
  if (
    def.messagePricing ||
    def.requireMessageOwnership ||
    def.opsOnly
  ) {
    fields.add("wallet");
  }
  return [...fields];
}

function genHandlerFn(def) {
  const name = handlerName(def);
  const pathParam = def.pathParam ?? def.apiPath.match(/\{([^}]+)\}/)?.[1] ?? null;
  const slug = def.slug;
  const ctxFields = handlerCtxBindings(def, pathParam);

  let body = "";
  body += `export async function ${name}(ctx: {\n`;
  body += `  request: Request;\n`;
  body += `  body?: unknown;\n`;
  body += `  query?: unknown;\n`;
  body += `  wallet?: string | null;\n`;
  body += `}) {\n`;
  body += `  const { ${ctxFields.join(", ")} } = ctx;\n`;

  if (pathParam) {
    body += `  const ${pathParam} = pathParamFromRequest(request, "${pathParam}");\n`;
  }

  if (def.opsOnly) {
    body += `  assertOpsWallet(wallet);\n`;
  }

  if (def.coldValidateInHandler) {
    body += `  await validateColdOutbound("${slug}", { body, request });\n`;
  }

  if (def.requireMessageOwnership && pathParam) {
    body += `  if (!wallet) throw Object.assign(new Error("Wallet required"), { status: 401 });\n`;
    body += `  await assertWalletOwnsMessage({ walletAddress: wallet, linqMessageId: ${pathParam} });\n`;
  }

  if (def.messagePricing === "outbound") {
    body += `  const { classified, priceUsd } = await reserveMessageSendSlots("${slug}", body, request, wallet ?? null);\n`;
  } else if (def.messagePricing === "followup") {
    body += `  const { priceUsd } = await reserveFollowUpMessageSlot(wallet ?? null, "${slug}");\n`;
  }

  body += `  try {\n`;

  const injectedBody = def.injectFrom
    ? "injectFromLine(body as Record<string, unknown>) as never"
    : "body as never";

  let sdkCall = def.rest
    ? def.sdkCall
        .replace(/\bbody\b/g, "body as never")
        .replace(
          "query ?? undefined",
          "(query as Record<string, string | string[] | undefined> | undefined) ?? undefined",
        )
    : def.sdkCall
        .replace(/\bbody\b/g, injectedBody)
        .replace(
          "query ?? undefined",
          "(query as Record<string, string | string[] | undefined> | undefined) ?? undefined",
        );

  if (pathParam) {
    sdkCall = sdkCall
      .replace(/\bchatId\b/g, pathParam)
      .replace(/\bmessageId\b/g, pathParam)
      .replace(/\battachmentId\b/g, pathParam)
      .replace(/\bphoneNumberId\b/g, pathParam)
      .replace(/\bpaymentRequestId\b/g, pathParam)
      .replace(/\bsubscriptionId\b/g, pathParam);
  }

  body += `    const result = await ${sdkCall};\n`;

  if (def.markWarm && def.slug === "messages/create") {
    body += `    await markColdRecipientsWarm(classified.cold);\n`;
  }

  if (def.recordSent) {
    body += `    await recordSentMessage({\n`;
    body += `      wallet,\n`;
    body += `      slug: "${slug}",\n`;
    body += `      body,\n`;
    body += `      result,\n`;
    body += `      priceUsd,\n`;
    if (def.messagePricing === "outbound") {
      body += `      classified,\n`;
    }
    if (pathParam) {
      body += `      chatId: ${pathParam},\n`;
    }
    body += `    });\n`;
  }

  body += `    return NextResponse.json(result ?? {});\n`;
  body += `  } catch (err) {\n`;
  body += `    throw mapLinqError(err);\n`;
  body += `  }\n`;
  body += `}\n`;

  return body;
}

function genHandlersFile(defs) {
  const importSet = collectHandlerImports(defs);
  const functions = defs.map((d) => genHandlerFn(d)).join("\n");
  return `${[...importSet].sort().join("\n")}\n\n${functions}`;
}

function collectRouteImports(def) {
  const imports = new Set();

  if (!def.opsOnly && def.auth === "paid-flat") {
    imports.add(`import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";`);
  } else if (def.messagePricing === "outbound") {
    imports.add(
      `import { quoteMessageSendPrice, maxMessageSendPrice } from "@/lib/routing/_shared/message-pricing";`,
    );
  } else if (def.messagePricing === "followup") {
    imports.add(
      `import { quoteFollowUpMessagePrice, maxMessageSendPrice } from "@/lib/routing/_shared/message-pricing";`,
    );
  }

  if (def.bodyImport) {
    imports.add(
      `import { ${def.bodyImport} } from "${schemaImportPath(def.bodyFrom)}";`,
    );
  }
  if (def.queryImport) {
    imports.add(
      `import { ${def.queryImport} } from "${schemaImportPath(def.queryFrom)}";`,
    );
  }
  if (def.outputImport) {
    imports.add(
      `import { ${def.outputImport} } from "${schemaImportPath(def.outputFrom)}";`,
    );
  }

  return imports;
}

function genRouteFile(defs, banner) {
  const importSet = new Set();
  const needsPaidOpts = defs.some(
    (d) => !d.opsOnly && d.auth.startsWith("paid"),
  );
  importSet.add(
    needsPaidOpts
      ? `import { router, paidOpts } from "@/lib/router";`
      : `import { router } from "@/lib/router";`,
  );
  for (const def of defs) {
    const routeImports = collectRouteImports(def);
    for (const imp of routeImports) importSet.add(imp);
  }
  const handlerNames = defs.map((d) => handlerName(d)).join(", ");
  importSet.add(`import { ${handlerNames} } from "./_shared/handlers";`);
  const exports = defs.map((d) => genRouteExportOnly(d)).join("\n");
  return `// ${banner}\n${[...importSet].sort().join("\n")}\n\n${exports}`;
}

function genRouteExportOnly(def) {
  const method = def.method;
  const routerPath = toRouterPath(def.apiPath);
  const routeId = def.slug.replace(/\//g, "-");
  const handler = handlerName(def);

  let chain = `router\n  .route("${routeId}")\n  .path("${routerPath}")\n  .method("${method}")\n`;

  if (def.opsOnly) {
    chain += `  .siwx()\n`;
  } else if (def.auth === "siwx") {
    chain += `  .siwx()\n`;
  } else if (def.auth === "paid-flat") {
    chain += `  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })\n`;
  } else if (def.messagePricing === "outbound") {
    chain += `  .paid((body) => quoteMessageSendPrice("${def.slug}", body), { ...paidOpts(), maxPrice: maxMessageSendPrice() })\n`;
  } else if (def.messagePricing === "followup") {
    chain += `  .paid(() => quoteFollowUpMessagePrice(), { ...paidOpts(), maxPrice: maxMessageSendPrice() })\n`;
  }

  if (def.bodyImport) chain += `  .body(${def.bodyImport})\n`;
  if (def.queryImport) chain += `  .query(${def.queryImport})\n`;
  chain += `  .output(${def.outputImport})\n`;
  chain += `  .description(${JSON.stringify(def.desc)})\n`;
  chain += `  .handler(${handler})`;

  return `export const ${method} = ${chain};\n`;
}

/** Agent-facing routes — excludes SIWX Linq reads, ops-only, and removed slugs. */
const AGENT_ROUTES = ROUTES.filter(isAgentRoute);
const OPS_ROUTES = ROUTES.filter(isOpsRoute);

/** @type {Map<string, RouteDef[]>} */
const agentRoutesByAppDir = new Map();
for (const def of AGENT_ROUTES) {
  const dir = appDirFor(def);
  if (!agentRoutesByAppDir.has(dir)) agentRoutesByAppDir.set(dir, []);
  agentRoutesByAppDir.get(dir).push(def);
}

/** @type {Map<string, RouteDef[]>} */
const opsRoutesByAppDir = new Map();
for (const def of OPS_ROUTES) {
  const dir = appDirFor(def);
  if (!opsRoutesByAppDir.has(dir)) opsRoutesByAppDir.set(dir, []);
  opsRoutesByAppDir.get(dir).push(def);
}

const activeAppDirs = new Set([
  ...agentRoutesByAppDir.keys(),
  ...opsRoutesByAppDir.keys(),
]);

const agentRegistryImports = [];
const opsRegistryImports = [];

for (const appDir of activeAppDirs) {
  const agentDefs = agentRoutesByAppDir.get(appDir) ?? [];
  const opsDefs = opsRoutesByAppDir.get(appDir) ?? [];
  const defs = [...agentDefs, ...opsDefs];
  const banner =
    agentDefs.length > 0 && opsDefs.length > 0
      ? "StableLinq: agent paid + ops SIWX (shared app dir)"
      : opsDefs.length > 0
        ? "StableLinq backend: ops SIWX (line configuration — allowlisted wallet)"
        : "StableLinq backend: linq-write (proxies Linq Partner API v3)";
  writeFile(join(appDir, "_shared/handlers.ts"), genHandlersFile(defs));
  writeFile(join(appDir, "route.ts"), genRouteFile(defs, banner));
  const importPath = registryImportPath(appDir);
  if (agentDefs.length > 0) agentRegistryImports.push(`import "${importPath}";`);
  if (opsDefs.length > 0) opsRegistryImports.push(`import "${importPath}";`);
}

writeFile(
  join(ROOT, "src/lib/routes.linq.registry.ts"),
  `// Generated by scripts/generate-routes.mjs — Linq write proxies (paid, agent-facing).\n${agentRegistryImports.join("\n")}\n`,
);

writeFile(
  join(ROOT, "src/lib/routes.stablelinq-ops.registry.ts"),
  `// Generated by scripts/generate-routes.mjs — ops SIWX (line config, allowlisted wallet).\n${opsRegistryImports.join("\n")}\n`,
);

writeFile(
  join(ROOT, "src/lib/routes.registry.ts"),
  `// Generated by scripts/generate-routes.mjs — side-effect imports register all routes.\nimport "@/lib/routes.linq.registry";\nimport "@/lib/routes.stablelinq.registry";\nimport "@/lib/routes.stablelinq-ops.registry";\n`,
);

const linqWriteRoutes = AGENT_ROUTES.map((def) => ({
  method: def.method,
  path: def.apiPath,
  slug: def.slug,
  backend: "linq-write",
}));

const opsWriteRoutes = OPS_ROUTES.map((def) => ({
  method: def.method,
  path: def.apiPath,
  slug: def.slug,
  backend: "stablelinq-ops",
}));

writeFile(
  join(ROOT, "src/lib/routes.backends.generated.ts"),
  `// Generated by scripts/generate-routes.mjs — Linq write proxy routes.\nexport const LINQ_WRITE_ROUTES = ${JSON.stringify(linqWriteRoutes, null, 2)} as const;\n\nexport const STABLELINQ_OPS_ROUTES = ${JSON.stringify(opsWriteRoutes, null, 2)} as const;\n`,
);

const removedDirs = new Set();
for (const slug of REMOVED_AGENT_WRITE_SLUGS) {
  const def = ROUTES.find((d) => d.slug === slug);
  if (def) removedDirs.add(appDirFor(def));
}

for (const dir of removedDirs) {
  if (activeAppDirs.has(dir)) continue;
  const routePath = join(dir, "route.ts");
  const handlersPath = join(dir, "_shared/handlers.ts");
  if (existsSync(routePath)) rmSync(routePath);
  if (existsSync(handlersPath)) rmSync(handlersPath);
}

const siwxOnlyDirs = new Set(
  ROUTES.filter((def) => def.auth === "siwx" && !def.opsOnly).map((def) =>
    appDirFor(def),
  ),
);
for (const dir of siwxOnlyDirs) {
  if (activeAppDirs.has(dir)) continue;
  const routePath = join(dir, "route.ts");
  const handlersPath = join(dir, "_shared/handlers.ts");
  if (existsSync(routePath)) rmSync(routePath);
  if (existsSync(handlersPath)) rmSync(handlersPath);
}

console.log(
  `Generated ${AGENT_ROUTES.length} agent routes, ${OPS_ROUTES.length} ops routes (${ROUTES.length - AGENT_ROUTES.length - OPS_ROUTES.length} SIWX Linq reads excluded) across ${activeAppDirs.size} app directories.`,
);
