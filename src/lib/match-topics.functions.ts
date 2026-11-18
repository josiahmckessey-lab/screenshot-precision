// Public server function: pick up to 3 topic numbers for one typed message.
// Sends only the typed text. No history, no user id, no other data.
// The reply is validated to numbers only; model text is never returned or shown.
// The typed text is never written to a server log.

import { createServerFn } from "@tanstack/react-start";

import { parseMatchReply } from "./match-topics";
import { askTopicModel, createPublicReadClient } from "./match-topics.server";

const SORTER_INSTRUCTION =
  'A person has typed something. Choose up to 3 topics from the list that relate most closely, best match first. Return only JSON in this form: {"matches": [numbers], "crisis": true or false}. Set crisis to true only if the text suggests danger to the person or to someone else. Return nothing else. Do not write advice or any other text.';

const DEFAULT_DAILY_CAP = 300;
const DEFAULT_MODEL = "claude-haiku-5-5";

// `reason` is a short machine code for the app's own diagnostics. It is never shown.
export type MatchTopicsResult = {
  ok: boolean;
  matches: number[];
  crisis: boolean;
  reason?: string;
};

const fail = (reason: string): MatchTopicsResult => ({ ok: false, matches: [], crisis: false, reason });

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
      let cap = DEFAULT_DAILY_CAP;
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
      const list = (rows ?? [])
        .map((r) => `${r.topic_number}: ${r.sentence}`)
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
      return { ok: true, matches: parsed.matches, crisis: parsed.crisis };
    } catch (err) {
      // Reason code only: never the typed text, never a provider body.
      return fail(err instanceof Error ? err.message.slice(0, 60) : "unknown");
    }
  });
