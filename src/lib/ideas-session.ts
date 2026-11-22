import { sanitizeMatches, sanitizeSayings, type MatchFit } from "@/lib/match-topics";

export const IDEAS_SESSION_KEY = "daybreak-ideas-v1";
export type IdeasResult = { text: string; matches: number[]; crisis: boolean; sayings?: Record<number, number>; fit?: MatchFit };

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
}