/**
 * Content contract for the public prototype.
 * A turn is a message. A request is the list of turns.
 * Service health is not part of this contract.
 */

export type { ChatMessage, ChatRequest, ChatResponse } from "./types";

export const CONTENT = ["ChatMessage", "ChatRequest", "ChatResponse"] as const;
