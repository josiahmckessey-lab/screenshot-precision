import { supabase } from "@/integrations/supabase/client";
import { redirect } from "@tanstack/react-router";
import type { Database } from "@/integrations/supabase/types";

export type DeeperEntry = {
  position: number; saying: string; what: string; try: string; sure_label: string; sure_note: string;
};
export type DeeperData = {
  chooser_heading: string;
  entries: DeeperEntry[];
  reach_beyond: { heading: string; lines: string[] };
  words: { term: string; def: string }[];
  related: { title: string; slug: string }[];
};
type DeeperRow = Database["public"]["Tables"]["library_deeper"]["Row"];
const object = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const strings = (value: unknown): string[] => Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

export function parseDeeper(row: DeeperRow): Omit<DeeperData, "related"> {
  const entries = Array.isArray(row.entries) ? row.entries.flatMap((value) => {
    const e = object(value);
    if (typeof e["position"] !== "number" || !["saying", "what", "try", "sure_label", "sure_note"].every((key) => typeof e[key] === "string")) return [];
    const entry = e as unknown as DeeperEntry;
    // Hold entries with excluded professional wording until the stored copy is corrected.
    if (/\b(?:therap\w*|counsel\w*|treatm\w*)\b/i.test(Object.values(entry).join(" "))) return [];
    return [entry];
  }).sort((a, b) => a.position - b.position) : [];
  const reach = object(row.reach_beyond);
  const words = Array.isArray(row.words) ? row.words.flatMap((value) => {
    const w = object(value);
    return typeof w["term"] === "string" && typeof w["def"] === "string" ? [{ term: w["term"], def: w["def"] }] : [];
  }) : [];
  return { chooser_heading: row.chooser_heading, entries, reach_beyond: { heading: typeof reach["heading"] === "string" ? reach["heading"] : "", lines: strings(reach["lines"]) }, words };
}

export async function loadDeeper(slug: string): Promise<DeeperData | null> {
  try {
    const topicNumber = Number(slug.replace("topic-", ""));
    const { data, error } = await supabase.from("library_deeper")
      .select("topic_number,chooser_heading,entries,reach_beyond,words,also_related,status,version")
      .eq("topic_number", topicNumber).maybeSingle();
    if (error || !data) return null;
    const numbers = Array.isArray(data.also_related) ? data.also_related.filter((v): v is number => typeof v === "number" && Number.isInteger(v)) : [];
    let related: DeeperData["related"] = [];
    if (numbers.length > 0) {
      try {
        const result = await supabase.from("library_pages").select("title,slug,topic_number").in("topic_number", numbers).eq("status", "active");
        if (!result.error) related = numbers.flatMap((number) => {
          const page = result.data?.find((p) => p.topic_number === number);
          return page ? [{ title: page.title, slug: page.slug }] : [];
        });
      } catch { /* Related links must not prevent the optional layer from opening. */ }
    }
    return { ...parseDeeper(data), related };
  } catch { return null; }
}

export async function loadDeeperPage(slug: string, position: string) {
  const data = await loadDeeper(slug);
  const entry = data?.entries.find((item) => String(item.position) === position);
  if (!data || (position !== "none" && !entry)) {
    throw redirect({ to: "/topic/$slug", params: { slug }, replace: true });
  }
  return { data, entry: entry ?? null };
}