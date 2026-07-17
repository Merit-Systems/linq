import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { isoDateTimeSchema } from "../common";
import {
  attachmentStatusSchema,
  httpMethodPutSchema,
  supportedContentTypeSchema,
} from "../enums";

export const attachmentCreateResponseSchema = z
  .object({
    attachment_id: z.string(),
    download_url: z.string().url(),
    expires_at: isoDateTimeSchema,
    http_method: httpMethodPutSchema,
    required_headers: z.record(z.string(), z.string()),
    upload_url: z.string().url(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.AttachmentCreateResponse>;

export const attachmentRetrieveResponseSchema = z
  .object({
    id: z.string(),
    content_type: supportedContentTypeSchema,
    created_at: isoDateTimeSchema,
    filename: z.string(),
    size_bytes: z.number(),
    status: attachmentStatusSchema,
    download_url: z.string().url().optional(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.AttachmentRetrieveResponse>;

export type AttachmentCreateResponse = z.infer<
  typeof attachmentCreateResponseSchema
>;
export type AttachmentRetrieveResponse = z.infer<
  typeof attachmentRetrieveResponseSchema
>;
