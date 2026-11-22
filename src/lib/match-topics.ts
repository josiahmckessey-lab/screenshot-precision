// Browser-safe helpers for the topic sorter. Only numbers ever leave these functions:
// text produced by the model is never returned, stored or shown.

import { bestTopics } from "@/lib/question-match";

export const FALLBACK_TOPICS = [1, 4, 8] as const;
export const DEFAULT_MATCH_DAILY_CAP = 1500;

export type MatchFit = "close" | "loose";
export type ParsedMatch = { matches: number[]; sayings: Record<number, number>; fit: MatchFit; crisis: boolean };

export function sanitizeSayings(raw: unknown, matches: number[]): Record<number, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const value = raw as Record<string, unknown>;
  const sayings: Record<number, number> = {};
  for (const topic of matches) {
    const position = value[String(topic)];
    if (typeof position === "number" && Number.isSafeInteger(position) && position >= 1) sayings[topic] = position;
  }
  return sayings;
}

/** Project only validated stored saying text, never model text. */
export function readStoredSayings(raw: unknown): { position: number; saying: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((value: unknown) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    const entry = value as Record<string, unknown>;
    const position = entry["position"];
    const saying = entry["saying"];
    if (typeof position !== "number" || !Number.isSafeInteger(position) || position < 1 || typeof saying !== "string") return [];
    if (/\b(?:therap\w*|counsel\w*|treatm\w*)\b/i.test(Object.values(entry).join(" "))) return [];
    return [{ position, saying }];
  });
}

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
): ParsedMatch | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  let parsed: unknown;
  try {
    parsed = JSON.parse(start >= 0 && end > start ? text.slice(start, end + 1) : text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const raw = Array.isArray(parsed) ? parsed : obj["matches"];
  const matches: number[] = [];
  const sayings: Record<number, number> = {};
  if (Array.isArray(raw)) for (const value of raw) {
    const entry = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
    const topic = entry ? entry["topic"] : value;
    if (typeof topic !== "number" || !Number.isInteger(topic) || topic < 1 || topic > 20 || matches.includes(topic)) continue;
    matches.push(topic);
    const saying = entry?.["saying"];
    if (typeof saying === "number" && Number.isSafeInteger(saying) && saying >= 1) sayings[topic] = saying;
    if (matches.length === 3) break;
  }
  if (matches.length === 0 && (!Array.isArray(raw) || raw.length > 0)) return null;
  return { matches, sayings, fit: obj["fit"] === "close" ? "close" : "loose", crisis: obj["crisis"] === true };
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
