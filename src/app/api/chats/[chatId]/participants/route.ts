import { FLAT_PRICE_USD_STRING } from "@/lib/pricing";
import { handleChatsParticipantsAdd, handleChatsParticipantsRemove } from "./_shared/handlers";
import { participantAddParamsSchema } from "@/lib/schemas/linq/params/participant-add-params";
import { participantAddResponseSchema } from "@/lib/schemas/linq/responses/participant-responses";
import { participantRemoveParamsSchema } from "@/lib/schemas/linq/params/participant-remove-params";
import { participantRemoveResponseSchema } from "@/lib/schemas/linq/responses/participant-responses";
import { router, paidOpts } from "@/lib/router";

export const POST = router
  .route("chats-participants-add")
  .path("chats/:chatId/participants")
  .method("POST")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(participantAddParamsSchema)
  .output(participantAddResponseSchema)
  .description("Add participants to a group chat.")
  .handler(handleChatsParticipantsAdd);

export const DELETE = router
  .route("chats-participants-remove")
  .path("chats/:chatId/participants")
  .method("DELETE")
  .paid(FLAT_PRICE_USD_STRING, { ...paidOpts(), maxPrice: FLAT_PRICE_USD_STRING })
  .body(participantRemoveParamsSchema)
  .output(participantRemoveResponseSchema)
  .description("Remove participants from a group chat.")
  .handler(handleChatsParticipantsRemove);
