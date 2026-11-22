// Server-only: the topic sorter's outside call and its public library read.
// The typed text is never written to a log, and provider errors are reduced to a status.

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
// The model thinks before answering, so the budget has to cover thinking plus the JSON.
const MAX_REPLY_TOKENS = 1000;

/** Read-only client for public library rows. Never holds a session. */
export function createPublicReadClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("backend_not_configured");
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        // Opaque sb_ keys are not JWTs: send only apikey.
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/**
 * Ask the model to pick topic numbers. Returns the raw reply text only;
 * the caller validates it and never shows it.
 */
export async function askTopicModel(
  key: string,
  model: string,
  instruction: string,
  request: string,
): Promise<string> {
  const res = await fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model,
      max_tokens: MAX_REPLY_TOKENS,
      system: instruction,
      messages: [{ role: "user", content: request }],
    }),
  });
  if (!res.ok) throw new Error(`provider_status_${res.status}`);
  const body: unknown = await res.json();
  const content = (body as { content?: unknown })?.content;
  if (!Array.isArray(content)) return "";
  return content
    .map((part) => {
      const p = part as { type?: unknown; text?: unknown };
      return p?.type === "text" && typeof p.text === "string" ? p.text : "";
    })
    .join("");
}
