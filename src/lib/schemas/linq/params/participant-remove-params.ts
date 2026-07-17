import type { ParticipantRemoveParams } from "@linqapp/sdk/resources/chats/participants";
import { z } from "zod";

export const participantRemoveParamsSchema = z
  .object({
    handle: z.string(),
  })
  .strict() satisfies z.ZodType<ParticipantRemoveParams>;

export type ParticipantRemoveParamsInput = z.infer<
  typeof participantRemoveParamsSchema
>;
