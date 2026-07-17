#!/usr/bin/env node
/**
 * Generates route modules (index.ts, schema.ts, handler.ts) and app/api re-exports.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

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
    desc: "Send a message to one or more recipients. Outbound-first pricing applies per new recipient (50/day cap).",
    messagePricing: "outbound",
    injectFrom: true,
    markWarm: true,
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
    slug: "attachments/retrieve",
    apiPath: "attachments/{attachmentId}",
    method: "GET",
    auth: "siwx",
    pathParam: "attachmentId",
    sdkCall: "linq.attachments.retrieve(attachmentId)",
    outputImport: "attachmentRetrieveResponseSchema",
    outputFrom: "responses/attachment-responses",
    desc: "Retrieve attachment metadata.",
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
  },
  {
    slug: "payment-requests/create",
    apiPath: "payment-requests",
    method: "POST",
    auth: "paid-flat",
    sdkCall: "createPaymentRequest(body)",
    bodyImport: "paymentRequestCreateParamsSchema",
    bodyFrom: "params/payment-request-create-params",
    outputImport: "paymentRequestSchema",
    outputFrom: "payment-requests",
    desc: "Create a Linq payment request (SDK gap — REST).",
    rest: true,
  },
  {
    slug: "payment-requests/list",
    apiPath: "payment-requests",
    method: "GET",
    auth: "siwx",
    sdkCall: "listPaymentRequests(query ?? undefined)",
    queryImport: "paymentRequestListParamsSchema",
    queryFrom: "params/payment-request-list-params",
    outputImport: "paymentRequestListResponseSchema",
    outputFrom: "payment-requests",
    desc: "List payment requests.",
    rest: true,
  },
  {
    slug: "payment-requests/retrieve",
    apiPath: "payment-requests/{paymentRequestId}",
    method: "GET",
    auth: "siwx",
    pathParam: "paymentRequestId",
    sdkCall: "retrievePaymentRequest(paymentRequestId)",
    outputImport: "paymentRequestSchema",
    outputFrom: "payment-requests",
    desc: "Retrieve a payment request.",
    rest: true,
  },
  {
    slug: "payment-requests/cancel",
    apiPath: "payment-requests/{paymentRequestId}/cancel",
    method: "POST",
    auth: "paid-flat",
    pathParam: "paymentRequestId",
    sdkCall: "cancelPaymentRequest(paymentRequestId)",
    outputImport: "paymentRequestSchema",
    outputFrom: "payment-requests",
    desc: "Cancel a payment request.",
    rest: true,
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

function collectHandlerImports(def) {
  const imports = new Set([
    `import { NextResponse } from "next/server";`,
    `import { mapLinqError } from "@/lib/linq/errors";`,
  ]);

  if (def.rest) {
    imports.add(
      `import { ${def.sdkCall.replace(/\(.*/, "")} } from "@/lib/linq/rest";`,
    );
  } else {
    imports.add(`import { linq } from "@/lib/linq/client";`);
  }

  if (def.messagePricing === "outbound") {
    imports.add(
      `import { reserveMessageSendSlots, markColdRecipientsWarm } from "@/lib/routing/_shared/message-pricing";`,
    );
  } else if (def.messagePricing === "followup") {
    imports.add(
      `import { reserveFollowUpMessageSlot } from "@/lib/routing/_shared/message-pricing";`,
    );
  }

  if (def.injectFrom) {
    imports.add(
      `import { injectFromLine } from "@/lib/routing/_shared/from-line";`,
    );
  }

  if (def.coldValidateInHandler) {
    imports.add(
      `import { validateColdOutbound } from "@/lib/routing/_shared/first-message-validate";`,
    );
  }

  if (def.pathParam ?? def.apiPath.match(/\{([^}]+)\}/)?.[1]) {
    imports.add(
      `import { pathParamFromRequest } from "@/lib/routing/_shared/path-params";`,
    );
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
  if (def.messagePricing) fields.add("wallet");
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

  if (def.coldValidateInHandler) {
    body += `  await validateColdOutbound("${slug}", { body, request });\n`;
  }

  if (def.messagePricing === "outbound") {
    body += `  const { classified } = await reserveMessageSendSlots("${slug}", body, request, wallet ?? null);\n`;
  } else if (def.messagePricing === "followup") {
    body += `  await reserveFollowUpMessageSlot(wallet ?? null, "${slug}");\n`;
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

  if (def.markWarm && def.slug === "chats/create") {
    body += `    await markColdRecipientsWarm(classified.cold, (result as { chat?: { id?: string } }).chat?.id);\n`;
  } else if (def.markWarm && def.slug === "messages/create") {
    body += `    await markColdRecipientsWarm(classified.cold);\n`;
  }

  body += `    return NextResponse.json(result ?? {});\n`;
  body += `  } catch (err) {\n`;
  body += `    throw mapLinqError(err);\n`;
  body += `  }\n`;
  body += `}\n`;

  return body;
}

function genHandlersFile(defs) {
  const importSet = new Set();
  for (const def of defs) {
    for (const imp of collectHandlerImports(def)) importSet.add(imp);
  }
  const functions = defs.map((d) => genHandlerFn(d)).join("\n");
  return `${[...importSet].sort().join("\n")}\n\n${functions}`;
}

function collectRouteImports(def) {
  const imports = new Set();

  if (def.auth === "paid-flat") {
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

function genRouteFile(defs) {
  const importSet = new Set();
  const needsPaidOpts = defs.some((d) => d.auth.startsWith("paid"));
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
  return `${[...importSet].sort().join("\n")}\n\n${exports}`;
}

function genRouteExportOnly(def) {
  const method = def.method;
  const routerPath = toRouterPath(def.apiPath);
  const routeId = def.slug.replace(/\//g, "-");
  const handler = handlerName(def);

  let chain = `router\n  .route("${routeId}")\n  .path("${routerPath}")\n  .method("${method}")\n`;

  if (def.auth === "siwx") {
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

/** @type {Map<string, RouteDef[]>} */
const routesByAppDir = new Map();
for (const def of ROUTES) {
  const dir = appDirFor(def);
  if (!routesByAppDir.has(dir)) routesByAppDir.set(dir, []);
  routesByAppDir.get(dir).push(def);
}

const registryImports = [];

for (const [appDir, defs] of routesByAppDir) {
  writeFile(join(appDir, "_shared/handlers.ts"), genHandlersFile(defs));
  writeFile(join(appDir, "route.ts"), genRouteFile(defs));
  registryImports.push(`import "${registryImportPath(appDir)}";`);
}

writeFile(
  join(ROOT, "src/lib/routes.registry.ts"),
  `// Generated by scripts/generate-routes.mjs — side-effect imports register all routes.\n${registryImports.join("\n")}\n`,
);

console.log(
  `Generated ${ROUTES.length} routes across ${routesByAppDir.size} app directories.`,
);
