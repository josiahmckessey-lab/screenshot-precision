import { beforeEach, describe, expect, it } from "vitest";
import { clearIdeas, IDEAS_SESSION_KEY, readIdeas, saveIdeas } from "@/lib/ideas-session";
import { DEFAULT_MATCH_DAILY_CAP } from "@/lib/match-topics";

describe("Ideas session rules", () => {
  beforeEach(() => { sessionStorage.clear(); localStorage.clear(); });
  it("keeps the typed text, ordered topic numbers and crisis state only in session storage", () => {
    const result = { text: "panic and loneliness", matches: [4, 8], crisis: true };
    saveIdeas(sessionStorage, result);
    expect(readIdeas(sessionStorage)).toEqual(result);
    expect(localStorage.getItem(IDEAS_SESSION_KEY)).toBeNull();
  });
  it("replaces previous cards with new results", () => {
    saveIdeas(sessionStorage, { text: "panic", matches: [4], crisis: false });
    saveIdeas(sessionStorage, { text: "alone", matches: [8], crisis: false });
    expect(readIdeas(sessionStorage)).toEqual({ text: "alone", matches: [8], crisis: false });
  });
  it("start over clears stored results", () => {
    saveIdeas(sessionStorage, { text: "panic", matches: [4], crisis: false });
    clearIdeas(sessionStorage);
    expect(readIdeas(sessionStorage)).toBeNull();
  });
  it("uses a total daily sorter cap of 1500", () => {
    expect(DEFAULT_MATCH_DAILY_CAP).toBe(1500);
  });
});