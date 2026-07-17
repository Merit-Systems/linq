import type { ParticipantAddResponse } from "@linqapp/sdk/resources/chats/participants";
import type { ParticipantRemoveResponse } from "@linqapp/sdk/resources/chats/participants";
import { z } from "zod";
import { statusTraceResponseSchema } from "../common";

export const participantAddResponseSchema =
  statusTraceResponseSchema satisfies z.ZodType<ParticipantAddResponse>;

export const participantRemoveResponseSchema =
  statusTraceResponseSchema satisfies z.ZodType<ParticipantRemoveResponse>;

export type { ParticipantAddResponse, ParticipantRemoveResponse };
