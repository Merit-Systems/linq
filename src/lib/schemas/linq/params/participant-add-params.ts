import type { ParticipantAddParams } from "@linqapp/sdk/resources/chats/participants";
import { z } from "zod";

export const participantAddParamsSchema = z
  .object({
    handle: z.string(),
  })
  .strict() satisfies z.ZodType<ParticipantAddParams>;

export type ParticipantAddParamsInput = z.infer<
  typeof participantAddParamsSchema
>;
