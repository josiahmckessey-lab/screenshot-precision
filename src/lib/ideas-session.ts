import { sanitizeMatches, sanitizeSayings, type MatchFit } from "@/lib/match-topics";
import { IDEAS_ECHO_END } from "@/lib/brand";

export const IDEAS_SESSION_KEY = "daybreak-ideas-v1";
// Set when a result is first saved, cleared once its lead in line has played.
export const IDEAS_FRESH_KEY = "daybreak-ideas-fresh-v1";
export type IdeasResult = { text: string; matches: number[]; crisis: boolean; sayings?: Record<number, number>; fit?: MatchFit };

export function ideasEcho(result: IdeasResult | null): string | null {
  if (!result) return null;
  return result.text.length > 400 ? result.text.slice(0, 400) + IDEAS_ECHO_END : result.text;
}

export function saveIdeas(storage: Storage, result: IdeasResult) {
  storage.setItem(IDEAS_SESSION_KEY, JSON.stringify(result));
}

export function readIdeas(storage: Storage): IdeasResult | null {
  try {
    const raw: unknown = JSON.parse(storage.getItem(IDEAS_SESSION_KEY) ?? "null");
    if (!raw || typeof raw !== "object") return null;
    const value = raw as Record<string, unknown>;
    const matches = sanitizeMatches(value["matches"]);
    if (typeof value["text"] !== "string" || !matches.length) return null;
    return { text: value["text"], matches, crisis: value["crisis"] === true,
      ...(value["sayings"] !== undefined ? { sayings: sanitizeSayings(value["sayings"], matches) } : {}),
      ...(value["fit"] !== undefined ? { fit: value["fit"] === "close" ? "close" as const : "loose" as const } : {}),
    };
  } catch {
    return null;
  }
}

export function clearIdeas(storage: Storage) {
  storage.removeItem(IDEAS_SESSION_KEY);
  storage.removeItem(IDEAS_FRESH_KEY);
}

export function markIdeasFresh(storage: Storage) {
  storage.setItem(IDEAS_FRESH_KEY, "1");
}

export function isIdeasFresh(storage: Storage): boolean {
  return storage.getItem(IDEAS_FRESH_KEY) === "1";
}

export function clearIdeasFresh(storage: Storage) {
  storage.removeItem(IDEAS_FRESH_KEY);
}