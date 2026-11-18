import { z } from "zod";

export const guideMessageSchema = z.object({
  body: z.string().min(1).max(3000).refine((s) => s.trim().length > 0),
  reply_to: z.string().max(200).email().optional().or(z.literal("")),
  included_question: z.string().max(2000).optional(),
  website: z.string().max(0),
});
export type GuideMessageInput = z.infer<typeof guideMessageSchema>;
export const GUIDE_RATE_KEY = "daybreak-guide-sends-v1";
export const GUIDE_HOUR_MS = 3_600_000;
export const GUIDE_DEVICE_CAP = 5;
export const GUIDE_DAILY_CAP = 100;

export function recentGuideSends(storage: Storage, now: number): number[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(GUIDE_RATE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((n): n is number => typeof n === "number" && n > now - GUIDE_HOUR_MS && n <= now) : [];
  } catch { return []; }
}
export function canSendGuide(storage: Storage, now: number) {
  return recentGuideSends(storage, now).length < GUIDE_DEVICE_CAP;
}
export function recordGuideSend(storage: Storage, now: number) {
  storage.setItem(GUIDE_RATE_KEY, JSON.stringify([...recentGuideSends(storage, now), now]));
}

export async function saveThenNotify(
  save: () => Promise<string | null>, notify: (id: string) => Promise<void>,
): Promise<{ status: "received" | "capped" }> {
  const id = await save();
  if (!id) return { status: "capped" };
  try { await notify(id); } catch { /* Saved messages remain received even if delivery fails. */ }
  return { status: "received" };
}