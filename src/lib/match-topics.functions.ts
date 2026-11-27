// Public server function: pick up to 3 topic numbers for one typed message.
// Sends only the typed text. No history, no user id, no other data.
// The reply is validated to numbers only; model text is never returned or shown.
// The typed text is never written to a server log.

import { createServerFn } from "@tanstack/react-start";

import { DEFAULT_MATCH_DAILY_CAP, parseMatchReply, readStoredSayings, type ParsedMatch } from "./match-topics";
import { askTopicModel, createPublicReadClient } from "./match-topics.server";

const SORTER_INSTRUCTION =
  'A person has typed something. It may be a struggle, a curiosity, a question about someone else, or an ordinary thought. All of these are welcome. Match by idea, not by whether the person seems to have a problem. Choose up to 3 topics that relate most closely, best match first. For each topic also give the number of the closest saying under it, or null if none is close. Return only JSON in this form: {"matches":[{"topic":number,"saying":number or null}],"fit":"close" or "loose","crisis":true or false}. Set fit to close only if the first match plainly relates to the typed text, otherwise loose. Set crisis to true only if the text suggests danger to the person or to someone else. Return nothing else. Do not write advice or any other text.';

const DEFAULT_MODEL = "claude-haiku-5-5";

// `reason` is a short machine code for the app's own diagnostics. It is never shown.
export type MatchTopicsResult = ParsedMatch & {
  ok: boolean;
  reason?: string;
};

const fail = (reason: string): MatchTopicsResult => ({ ok: false, matches: [], sayings: {}, fit: "loose", crisis: false, reason });

export const getKeptTopic = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: unknown }) => ({
    slug: typeof data?.slug === "string" && data.slug.length <= 128 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug) ? data.slug : "",
  }))
  .handler(async ({ data }) => {
    if (!data.slug) return null;
    const client = createPublicReadClient();
    const result = await client.from("library_pages").select("try_text").eq("slug", data.slug).eq("status", "active").maybeSingle();
    return result.error ? null : result.data;
  });

export const getIdeasLibrary = createServerFn({ method: "GET" }).handler(async () => {
  const client = createPublicReadClient();
  const [topics, deeper] = await Promise.all([
    client.from("library_pages").select("slug,title,topic_number,home_line,sentence").eq("status", "active"),
    client.from("library_deeper").select("topic_number,entries").eq("status", "active"),
  ]);
  if (topics.error) throw new Error("The ideas could not be loaded.");
  return { topics: topics.data ?? [], deeper: deeper.error ? [] : (deeper.data ?? []).map((row) => ({ topic_number: row.topic_number, entries: readStoredSayings(row.entries) })) };
});

export const match_topics = createServerFn({ method: "POST" })
  .inputValidator((data: { text?: unknown }) => ({
    text: typeof data?.text === "string" ? data.text.trim().slice(0, 2000) : "",
  }))
  .handler(async ({ data }): Promise<MatchTopicsResult> => {
    if (!data.text) return fail("empty");
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Daily cap first: at the cap nothing is sent anywhere, and the app falls back
      // to on-device matching. Safety checks stay on the device and are never gated here.
      const capRow = await supabaseAdmin
        .from("app_config")
        .select("value")
        .eq("key", "match_topic_daily_cap")
        .maybeSingle();
      let cap = DEFAULT_MATCH_DAILY_CAP;
      if (!capRow.error && typeof capRow.data?.value === "number") cap = capRow.data.value;
      const counted = await supabaseAdmin.rpc("record_match_call");
      if (typeof counted.data !== "number") return fail("count_error");
      if (counted.data > cap) return fail("capped");

      const modelRow = await supabaseAdmin
        .from("app_config")
        .select("value")
        .eq("key", "model_match_topics")
        .maybeSingle();
      let model = DEFAULT_MODEL;
      if (!modelRow.error && typeof modelRow.data?.value === "string") model = modelRow.data.value;

      const key = process.env["ANTHROPIC_API_KEY"];
      if (!key) return fail("no_key");

      const client = createPublicReadClient();
      const { data: rows, error } = await client
        .from("library_pages")
        .select("topic_number,sentence")
        .eq("status", "active")
        .order("topic_number");
      if (error) return fail("library_read");
      const deeper = await client.from("library_deeper").select("topic_number,entries").eq("status", "active");
      if (deeper.error) return fail("library_read");
      const list = (rows ?? [])
        .map((r) => [`T${r.topic_number}: ${r.sentence}`, ...readStoredSayings(deeper.data?.find((d) => d.topic_number === r.topic_number)?.entries)
          .map((entry) => `  ${r.topic_number}.${entry.position}: ${entry.saying}`)].join("\n"))
        .join("\n");
      if (!list) return fail("no_rows");

      const reply = await askTopicModel(
        key,
        model,
        SORTER_INSTRUCTION,
        `Topics:\n${list}\n\nTyped text:\n${data.text}`,
      );
      const parsed = parseMatchReply(reply);
      if (!parsed) return fail("parse");
      return { ok: true, ...parsed };
    } catch (err) {
      // Reason code only: never the typed text, never a provider body.
      return fail(err instanceof Error ? err.message.slice(0, 60) : "unknown");
    }
  });
