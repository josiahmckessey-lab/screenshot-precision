import { replySchema, type GeneratedReply } from "./chat-contract";

export const bannedPattern = new RegExp("\\b(" + ["ther"+"apy","ther"+"apists?","coun"+"selors?","coun"+"sellors?","coun"+"seling","coun"+"selling","treat"+"ments?"].join("|") + ")\\b", "i");
export function cleanMessage(raw: string) {
  if (Array.from(raw).length > 2000) throw new Error("Please keep your message to 2,000 characters or fewer.");
  const cleaned = raw.normalize("NFKC").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g, "").trim();
  if (!cleaned) throw new Error("Please write a little about what's happening.");
  if (Array.from(cleaned).length > 2000) throw new Error("Please keep your message to 2,000 characters or fewer.");
  return cleaned;
}
export function keywordCrisis(message: string) {
  return /\b(suicid\w*|self[ -]?harm|kill (myself|yourself|him|her|them)|end my life|hurt (myself|someone)|overdos\w*|abuse\w*|abusiv\w*|emergency|danger\w*|not safe|unsafe|bleeding|can't breathe|cannot breathe|weapon|rape\w*|assault\w*)\b/i.test(message);
}
export function mentionsFaith(message: string) { return /\b(god|jesus|bible|christ\w*|faith|pray\w*|scripture|church|religion|spiritual\w*)\b/i.test(message); }
export function validReply(raw: unknown, settings: { verse_on: boolean; story_on: boolean }, faithAllowed: boolean): GeneratedReply | null {
  const parsed = replySchema.safeParse(raw);
  if (!parsed.success) return null;
  const r = parsed.data;
  const text = [r.grounding,r.question,...r.parts.flatMap(p=>[p.title,p.text,p.reference,p.practical])].filter(Boolean).join(" ");
  if (bannedPattern.test(text) || /\b(you (have|suffer from|are diagnosed with)|your diagnosis is|you are (bipolar|autistic|depressed|schizophrenic))\b/i.test(text)) return null;
  if (!faithAllowed && (mentionsFaith(text) || r.faith_story)) return null;
  if (r.mode === "steady") return r.parts.length === 0 && !r.faith_story && Boolean(r.grounding?.trim()) && Boolean(r.question?.trim()) ? r : null;
  if (r.grounding !== null || r.question !== null) return null;
  const expected = ["picture","phenomenon",...(settings.story_on ? ["story"] : []),"next",...(settings.verse_on && !r.faith_story ? ["verse"] : [])];
  if (JSON.stringify(r.parts.map(p=>p.id)) !== JSON.stringify(expected)) return null;
  if (r.faith_story && !settings.story_on) return null;
  for (const p of r.parts) {
    if (!p.title.trim() || !p.text.trim()) return null;
    if (p.id === "verse" && (!p.reference?.trim() || !p.practical?.trim())) return null;
    if (p.id !== "verse" && (p.reference !== null || p.practical !== null)) return null;
  }
  return r;
}