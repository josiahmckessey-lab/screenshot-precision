import { z } from "zod";

export const replySchema = z.object({
  mode: z.enum(["steady", "full"]),
  grounding: z.string().nullable(), question: z.string().nullable(),
  faith_story: z.boolean(),
  parts: z.array(z.object({
    id: z.enum(["picture","phenomenon","story","next","verse"]),
    title: z.string(), text: z.string(), reference: z.string().nullable(), practical: z.string().nullable(),
  })),
});
export type GeneratedReply = z.infer<typeof replySchema>;
export type ChatReply = GeneratedReply | { mode: "safety" | "steady"; message: string };
export type ChatInput = { message: string; conversationId?: string | undefined; history?: { role: "user" | "assistant"; content: string }[] | undefined };
export type ChatResult = { reply: ChatReply; conversationId: string | null; saved: boolean };