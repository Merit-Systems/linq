import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { supportedContentTypeSchema } from "../enums";

export const attachmentCreateParamsSchema = z
  .object({
    content_type: supportedContentTypeSchema,
    filename: z.string(),
    size_bytes: z.number().int().positive(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.AttachmentCreateParams>;

export type AttachmentCreateParams = z.infer<
  typeof attachmentCreateParamsSchema
>;
