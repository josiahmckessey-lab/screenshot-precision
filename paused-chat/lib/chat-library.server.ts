import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { ChatInput } from "./chat-contract";

export const routingSchema = z.object({
  mode: z.enum(["steady", "full"]),
  entries: z.array(z.number().int().positive()).max(3),
  story_id: z.string().nullable(),
});
export type LibraryRoute = z.infer<typeof routingSchema>;

export function invitedFaith(message: string) {
  return /\b(god|prayer|church|scripture)\b/i.test(message);
}

export async function loadInstruction(admin: SupabaseClient<Database>, slug: "core" | "index") {
  const { data, error } = await admin.from("brain_chunks").select("body").eq("slug", slug).single();
  if (error || !data?.body || data.body.includes("PLACEHOLDER:")) throw new Error("The reply library is not ready yet.");
  return data.body;
}

export async function loadReplyLibrary(
  admin: SupabaseClient<Database>, route: LibraryRoute,
  settings: { verse_on: boolean; story_on: boolean }, faithInvited: boolean,
  knowMore: ChatInput["knowMore"],
) {
  const steady = route.mode === "steady";
  const entries = steady ? [4] : [...new Set(knowMore ? [knowMore.entryNumber] : route.entries)].slice(0, 3);
  const kinds = steady ? ["entry"] : ["entry", ...(settings.verse_on || faithInvited ? ["entry_faith"] : [])];
  const { data, error } = entries.length
    ? await admin.from("brain_chunks").select("body,kind,entry_number").in("kind", kinds).in("entry_number", entries)
    : { data: [], error: null };
  if (error || entries.some(n => !data?.some(row => row.kind === "entry" && row.entry_number === n))) {
    throw new Error("The reply library is not ready yet.");
  }
  const chunks = [...(data ?? [])];
  if (!steady && knowMore && knowMore.level >= 2) {
    const { data: deep, error: deepError } = await admin.from("brain_chunks").select("body,kind,entry_number")
      .eq("kind", "entry_deep").eq("entry_number", knowMore.entryNumber);
    if (deepError) throw new Error("We couldn't load the reply library.");
    chunks.push(...(deep ?? []));
  }
  let story: { body: string; faith_layer: boolean } | null = null;
  if (!steady && settings.story_on && route.story_id) {
    let query = admin.from("brain_chunks").select("body,faith_layer").eq("kind", "story").eq("status", "active");
    if (!faithInvited) query = query.eq("faith_layer", false);
    // The index can identify a story by its library number or by its row UUID.
    query = z.string().uuid().safeParse(route.story_id).success
      ? query.eq("id", route.story_id) : query.eq("story_number", route.story_id);
    const { data: selectedStory, error: storyError } = await query.maybeSingle();
    if (storyError) throw new Error("We couldn't load the selected story.");
    story = selectedStory;
  }
  return {
    library: [...chunks.map(c => c.body), ...(story ? [story.body] : [])].join("\n"),
    entries, mode: route.mode, faithStory: story?.faith_layer === true,
    hasStory: story !== null,
  };
}