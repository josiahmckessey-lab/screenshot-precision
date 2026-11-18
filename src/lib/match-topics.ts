// Browser-safe helpers for the topic sorter. Only numbers ever leave these functions:
// text produced by the model is never returned, stored or shown.

import { bestTopics } from "@/lib/question-match";

export const FALLBACK_TOPICS = [1, 4, 8] as const;
export const DEFAULT_MATCH_DAILY_CAP = 1500;

/** Keep only whole numbers from 1 to 20, at most 3, no repeats. */
export function sanitizeMatches(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const seen: number[] = [];
  for (const value of raw) {
    if (typeof value !== "number" || !Number.isInteger(value)) continue;
    if (value < 1 || value > 20) continue;
    if (seen.includes(value)) continue;
    seen.push(value);
    if (seen.length === 3) break;
  }
  return seen;
}

/**
 * Read the first JSON object out of a model reply and validate it.
 * Returns null when the reply is unusable, so the caller can fall back.
 */
export function parseMatchReply(
  text: string,
): { matches: number[]; crisis: boolean } | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const matches = sanitizeMatches(obj["matches"]);
  if (matches.length === 0) return null;
  return { matches, crisis: obj["crisis"] === true };
}

/**
 * Decide which topic numbers to show: server numbers when they are usable,
 * otherwise on-device keywords, otherwise the fixed starting point.
 */
export function pickTopicNumbers(
  server: { ok: boolean; matches: number[] } | null,
  text: string,
  available: number[],
): number[] {
  const fromServer = server?.ok ? sanitizeMatches(server.matches) : [];
  if (fromServer.length) return fromServer;
  return bestTopics(text, available) ?? [...FALLBACK_TOPICS];
}
