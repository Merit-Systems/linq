import { z } from "zod";
import { isoDateTimeSchema } from "../common";

export const locationRequestResponseSchema = z
  .object({
    message: z.string(),
    success: z.boolean(),
  })
  .strict();

export const getChatLocationResponseSchema = z
  .object({
    success: z.boolean(),
    data: z.object({
      type: z.literal("FeatureCollection"),
      features: z.array(
        z.object({
          type: z.literal("Feature"),
          geometry: z.object({
            type: z.literal("Point"),
            coordinates: z.array(z.number()),
          }),
          properties: z.object({
            handle: z.string(),
            address: z.string().optional(),
            locality: z.string().optional(),
            updated_at: isoDateTimeSchema.optional(),
          }),
        }),
      ),
    }),
  })
  .strict();

export type LocationRequestResponse = z.infer<
  typeof locationRequestResponseSchema
>;
export type GetChatLocationResponse = z.infer<
  typeof getChatLocationResponseSchema
>;
