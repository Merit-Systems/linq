import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";

export const serviceTypeSchema = z.enum([
  "iMessage",
  "SMS",
  "RCS",
]) satisfies z.ZodType<LinqAPIV3.ServiceType>;

export const reactionTypeSchema = z.enum([
  "love",
  "like",
  "dislike",
  "laugh",
  "emphasize",
  "question",
  "custom",
  "sticker",
]) satisfies z.ZodType<LinqAPIV3.ReactionType>;

export const screenEffectNameSchema = z.enum([
  "confetti",
  "fireworks",
  "lasers",
  "sparkles",
  "celebration",
  "hearts",
  "love",
  "balloons",
  "happy_birthday",
  "echo",
  "spotlight",
]);

export const bubbleEffectNameSchema = z.enum([
  "slam",
  "loud",
  "gentle",
  "invisible",
]);

export const messageEffectTypeSchema = z.enum(["screen", "bubble"]);

export const textDecorationStyleSchema = z.enum([
  "bold",
  "italic",
  "strikethrough",
  "underline",
]);

export const textDecorationAnimationSchema = z.enum([
  "big",
  "small",
  "shake",
  "nod",
  "explode",
  "ripple",
  "bloom",
  "jitter",
]);

export const supportedContentTypeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/tiff",
  "image/bmp",
  "image/svg+xml",
  "image/webp",
  "image/x-icon",
  "video/mp4",
  "video/quicktime",
  "video/mpeg",
  "video/mpeg2",
  "video/x-m4v",
  "video/x-msvideo",
  "video/3gpp",
  "audio/mpeg",
  "audio/mp3",
  "audio/x-m4a",
  "audio/mp4",
  "audio/x-caf",
  "audio/x-wav",
  "audio/x-aiff",
  "audio/aiff",
  "audio/aac",
  "audio/midi",
  "audio/amr",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/vcard",
  "text/rtf",
  "text/csv",
  "text/html",
  "text/calendar",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/x-iwork-pages-sffpages",
  "application/x-iwork-numbers-sffnumbers",
  "application/x-iwork-keynote-sffkey",
  "application/epub+zip",
  "text/xml",
  "application/json",
  "application/zip",
  "application/x-gzip",
]) satisfies z.ZodType<LinqAPIV3.SupportedContentType>;

export const deliveryStatusSchema = z.enum([
  "pending",
  "queued",
  "sent",
  "delivered",
  "received",
  "read",
  "failed",
]);

export const chatHealthStatusSchema = z.enum([
  "HEALTHY",
  "AT_RISK",
  "CRITICAL",
  "OPTED_OUT",
]);

export const phoneReputationStatusSchema = z.enum([
  "HEALTHY",
  "AT_RISK",
  "CRITICAL",
]);

export const participantStatusSchema = z.enum(["active", "left", "removed"]);

export const attachmentStatusSchema = z.enum(["pending", "complete", "failed"]);

export const fromSelectionReasonSchema = z.enum([
  "reused_active_chat",
  "new_best_number",
  "failover_flagged",
]);

export const messageThreadOrderSchema = z.enum(["asc", "desc"]);

export const reactionOperationSchema = z.enum(["add", "remove"]);

export const httpMethodPutSchema = z.literal("PUT");

export const webhookEventTypeSchema = z.enum([
  "message.sent",
  "message.received",
  "message.read",
  "message.delivered",
  "message.failed",
  "message.edited",
  "reaction.added",
  "reaction.removed",
  "participant.added",
  "participant.removed",
  "chat.created",
  "chat.group_name_updated",
  "chat.group_icon_updated",
  "chat.group_name_update_failed",
  "chat.group_icon_update_failed",
  "chat.typing_indicator.started",
  "chat.typing_indicator.stopped",
  "phone_number.status_updated",
  "call.initiated",
  "call.ringing",
  "call.answered",
  "call.ended",
  "call.failed",
  "call.declined",
  "call.no_answer",
  "location.sharing.started",
  "location.sharing.stopped",
]) satisfies z.ZodType<LinqAPIV3.WebhookEventType>;

export const paymentRequestModeSchema = z.enum(["payment", "subscription"]);

export const paymentRequestStatusSchema = z.enum([
  "requested",
  "succeeded",
  "canceled",
  "expired",
]);

export const subscriptionIntervalSchema = z.enum([
  "day",
  "week",
  "month",
  "year",
]);
