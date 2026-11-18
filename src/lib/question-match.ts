// On-device only: crisis phrase check and topic keyword matching for the question box.
// These lists are matching data, never shown in the app.
export const CRISIS_PHRASES = [
  "suicide", "kill myself", "end my life", "want to die", "wanna die", "not want to be here",
  "don't want to be here", "better off without me", "hurt myself", "harm myself", "self harm",
  "overdose", "someone is hurting me", "being abused",
];

export const TOPIC_KEYWORDS: Record<number, string[]> = {
  1: ["ruin", "sabotage", "good things", "safe", "familiar", "afraid", "hope", "push away", "pull away"],
  2: ["understand", "know better", "same thing", "habit", "reflex", "body", "memory", "change"],
  3: ["insight", "self-aware", "therapy", "explain", "realization", "reflect", "nothing changes"],
  4: ["calm", "panic", "anger", "overwhelmed", "breathe", "stress", "flooded", "shaking"],
  5: ["small", "choice", "no difference", "results", "slow", "practice", "repeat", "progress"],
  6: ["past", "trauma", "heal", "memory", "story", "fix", "regret", "forgive"],
  7: ["relapse", "back again", "same place", "started over", "slip", "setback", "repeat"],
  8: ["alone", "lonely", "friend", "mentor", "sponsor", "support", "guide", "peer"],
  9: ["letting go", "meaning", "suffering", "worth it", "medal", "survived", "hold on", "pain"],
  10: ["tough", "defensive", "pride", "distrust", "strength", "stubborn", "survive", "control"],
  11: ["craving", "urge", "addiction", "pull", "want", "temptation", "scrolling", "gambling"],
  12: ["stuck", "argue", "listen", "defensive", "change mind", "belief", "glasses", "frame"],
  13: ["label", "identity", "who am i", "diagnosis", "real self", "bad person", "nature", "find myself"],
  14: ["shame", "die to self", "humble", "true self", "mask", "worthless", "less of me", "ruined"],
  15: ["surrender", "control", "let go", "faith", "partnership", "trust", "grip", "submit"],
  16: ["loved", "worthy", "god", "church", "deserve", "belong", "grace", "hold"],
  17: ["progress", "behind", "measure", "score", "days", "goals", "compare", "direction"],
  18: ["genuine", "real change", "trust again", "sincere", "fake", "watching", "character", "prove"],
  19: ["cult", "group", "leader", "leave", "control", "church", "community", "pressure"],
  20: ["broken", "words", "phrase", "label", "identity", "heal", "dark side", "journey"],
};

const norm = (s: string) => s.toLowerCase().replace(/[\u2018\u2019]/g, "'");

export function hasCrisisPhrase(text: string): boolean {
  const t = norm(text);
  return CRISIS_PHRASES.some((p) => t.includes(p));
}

export function keywordCount(text: string, topicNumber: number): number {
  const t = norm(text);
  return (TOPIC_KEYWORDS[topicNumber] ?? []).filter((k) => t.includes(k)).length;
}

/** Up to three best topic numbers with count > 0; null when none match. */
export function bestTopics(text: string, topicNumbers: number[]): number[] | null {
  const scored = topicNumbers
    .map((n) => ({ n, c: keywordCount(text, n) }))
    .filter((x) => x.c > 0)
    .sort((a, b) => b.c - a.c || a.n - b.n);
  return scored.length ? scored.slice(0, 3).map((x) => x.n) : null;
}

export const RATE_MS = 3_000;
export function canSend(last: number | null, now: number): boolean {
  return last === null || now - last >= RATE_MS;
}
