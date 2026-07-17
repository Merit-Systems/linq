import { z } from "zod";

/** ISO-8601 datetime strings returned by the Linq API. */
export const isoDateTimeSchema = z.string();

export const uuidSchema = z.string().uuid();

export const e164PhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, "Expected E.164 phone number");

export const handleSchema = z.string().min(1);

export const statusTraceResponseSchema = z.object({
  message: z.string().optional(),
  status: z.string().optional(),
  trace_id: z.string().optional(),
});

export const emptyObjectSchema = z.object({}).strict();
