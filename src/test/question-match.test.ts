import { describe, expect, it } from "vitest";
import { bestTopics, canSend, hasCrisisPhrase } from "@/lib/question-match";

const all = Array.from({ length: 20 }, (_, i) => i + 1);
describe("question box rules", () => {
  it("flags crisis phrases ignoring case", () => {
    expect(hasCrisisPhrase("Some days I WANT TO DIE")).toBe(true);
    expect(hasCrisisPhrase("I don’t want to be here")).toBe(true);
    expect(hasCrisisPhrase("How do habits form?")).toBe(false);
  });
  it("picks up to three best-matching topics", () => {
    expect(bestTopics("panic and stress, can't breathe, shaking", all)).toEqual([4]);
    expect(bestTopics("alone and lonely, ashamed of the shame, a friend", all)?.[0]).toBe(8);
    expect(bestTopics("zzz qqq", all)).toBeNull();
  });
  it("pauses for exactly three seconds, with no minute limit", () => {
    expect(canSend(null, 1000)).toBe(true);
    expect(canSend(1000, 3999)).toBe(false);
    expect(canSend(1000, 4000)).toBe(true);
    expect(canSend(1000, 5000)).toBe(true);
  });
});
