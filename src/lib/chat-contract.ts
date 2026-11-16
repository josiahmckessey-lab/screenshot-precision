import { z } from "zod";

export const replySchema = z.object({
  mode: z.enum(["steady", "full"]),
  grounding: z.string().nullable(),
  question: z.string().nullable(),
  faith_story: z.boolean(),
  parts: z.array(
    z.object({
      id: z.enum(["picture", "phenomenon", "story", "next", "verse"]),
      title: z.string(),
      text: z.string(),
      reference: z.string().nullable(),
      practical: z.string().nullable(),
    }),
  ),
});
export type GeneratedReply = z.infer<typeof replySchema>;
export type ChatReply = GeneratedReply | { mode: "safety" | "steady"; message: string };
export const chatInputSchema = z.object({
  message: z.string(),
  conversationId: z.string().uuid().optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) }))
    .max(12)
    .optional(),
  knowMore: z
    .object({
      entryNumber: z.number().int().positive(),
      level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      partId: z.enum(["picture", "phenomenon", "story", "next", "verse"]).optional(),
      partText: z.string().max(6000).optional(),
    })
    .optional(),
});
export type ChatInput = z.infer<typeof chatInputSchema>;
export type ChatResult = {
  reply: ChatReply;
  conversationId: string | null;
  saved: boolean;
  entryNumber?: number | undefined;
  detail?: { partId: string; level: number; text: string } | undefined;
};
