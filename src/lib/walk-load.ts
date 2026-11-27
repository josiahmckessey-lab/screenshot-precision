import { supabase } from "@/integrations/supabase/client";
import { WALK_LOAD_ERROR } from "@/lib/brand";

export type WalkOption = { label: string; reply: string };
export type WalkItem = {
  topic_number: number; slug: string; title: string; picture: string; sentence: string;
  question: string; options: WalkOption[];
};

export function parseWalkOptions(value: unknown): WalkOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const option = entry as Record<string, unknown>;
    const label = option["label"];
    const reply = option["reply"];
    return typeof label === "string" && label.trim() && typeof reply === "string" && reply.trim()
      ? [{ label, reply }] : [];
  });
}

export async function loadWalk(): Promise<WalkItem[]> {
  const walk = await supabase.from("library_walk")
    .select("topic_number,question,options").eq("status", "active").order("topic_number");
  if (walk.error) throw new Error(WALK_LOAD_ERROR);
  const rows = walk.data ?? [];
  if (rows.length === 0) throw new Error(WALK_LOAD_ERROR);
  const pages = await supabase.from("library_pages")
    .select("slug,title,picture,sentence,topic_number").eq("status", "active")
    .in("topic_number", rows.map((row) => row.topic_number));
  if (pages.error) throw new Error(WALK_LOAD_ERROR);
  const items = rows.flatMap((row) => {
    const page = (pages.data ?? []).find((item) => item.topic_number === row.topic_number);
    return page ? [{ ...page, question: row.question, options: parseWalkOptions(row.options) }] : [];
  });
  if (items.length === 0) throw new Error(WALK_LOAD_ERROR);
  return items;
}
