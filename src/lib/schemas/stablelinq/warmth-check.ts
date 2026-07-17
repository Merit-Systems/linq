import { z } from "zod";
import { e164PhoneSchema } from "@/lib/schemas/linq/common";

export const warmthCheckParamsSchema = z
  .object({
    to: z.array(e164PhoneSchema).min(1),
  })
  .strict();

export const warmthCheckResultSchema = z.object({
  recipient: e164PhoneSchema,
  warmth: z.enum(["cold", "warm"]),
  chat_id: z.string().nullable(),
});

export const warmthCheckResponseSchema = z.object({
  from_line: e164PhoneSchema,
  results: z.array(warmthCheckResultSchema),
});

export type WarmthCheckParams = z.infer<typeof warmthCheckParamsSchema>;
export type WarmthCheckResponse = z.infer<typeof warmthCheckResponseSchema>;
