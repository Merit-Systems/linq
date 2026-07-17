import type LinqAPIV3 from "@linqapp/sdk";
import { z } from "zod";
import { phoneReputationStatusSchema } from "../enums";

export const phoneHealthStatusSchema = z
  .object({
    doc_url: z.string(),
    status: phoneReputationStatusSchema,
  })
  .strict();

export const phoneNumberSchema = z
  .object({
    id: z.string(),
    health_status: phoneHealthStatusSchema,
    phone_number: z.string(),
    reputation: phoneHealthStatusSchema,
    forwarding_number: z.string().nullish(),
  })
  .strict();

export const phoneNumberListResponseSchema = z
  .object({
    phone_numbers: z.array(phoneNumberSchema),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.PhoneNumberListResponse>;

export const phoneNumberUpdateResponseSchema = z
  .object({
    id: z.string(),
    forwarding_number: z.string().nullable(),
    phone_number: z.string(),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.PhoneNumberUpdateResponse>;

export const phonenumberCapabilitiesSchema = z
  .object({
    mms: z.boolean(),
    sms: z.boolean(),
    voice: z.boolean(),
  })
  .strict();

export const phonenumberListItemSchema = z
  .object({
    id: z.string(),
    phone_number: z.string(),
    capabilities: phonenumberCapabilitiesSchema.optional(),
    country_code: z.string().optional(),
    type: z.string().nullable().optional(),
  })
  .strict();

export const phonenumberListResponseSchema = z
  .object({
    phone_numbers: z.array(phonenumberListItemSchema),
  })
  .strict() satisfies z.ZodType<LinqAPIV3.PhonenumberListResponse>;
