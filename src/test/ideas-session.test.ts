import { beforeEach, describe, expect, it } from "vitest";
import { clearIdeas, ideasEcho, IDEAS_SESSION_KEY, readIdeas, saveIdeas } from "@/lib/ideas-session";
import { DEFAULT_MATCH_DAILY_CAP } from "@/lib/match-topics";

describe("Ideas session rules", () => {
  beforeEach(() => { sessionStorage.clear(); localStorage.clear(); });
  it("echoes no text without a saved result", () => {
    expect(ideasEcho(null)).toBeNull();
  });
  it("preserves typed line breaks up to 400 characters", () => {
    const text = "a".repeat(199) + "\n" + "b".repeat(200);
    expect(ideasEcho({ text, matches: [1], crisis: false })).toBe(text);
  });
  it("cuts longer typed text at 400 characters and adds three dots", () => {
    expect(ideasEcho({ text: "a".repeat(400) + "not echoed", matches: [1], crisis: false })).toBe("a".repeat(400) + "...");
  });
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

  it("reads new results and preserves old results without optional fields", () => {
    const result = { text: "a habit", matches: [5, 2], sayings: { 5: 3 }, fit: "close" as const, crisis: false };
    saveIdeas(sessionStorage, result);
    expect(readIdeas(sessionStorage)).toEqual(result);
    sessionStorage.setItem(IDEAS_SESSION_KEY, JSON.stringify({ text: "older result", matches: [2], crisis: false }));
    expect(readIdeas(sessionStorage)).toEqual({ text: "older result", matches: [2], crisis: false });
  });

  it("rejects invalid saved saying numbers and defaults invalid fit to loose", () => {
    sessionStorage.setItem(IDEAS_SESSION_KEY, JSON.stringify({ text: "a habit", matches: [1, 5, 20], sayings: { 1: 0, 5: 2, 20: 1.5, 7: 3 }, fit: "near", crisis: false }));
    expect(readIdeas(sessionStorage)).toEqual({ text: "a habit", matches: [1, 5, 20], sayings: { 5: 2 }, fit: "loose", crisis: false });
    sessionStorage.setItem(IDEAS_SESSION_KEY, JSON.stringify({ text: "a habit", matches: [5], sayings: [2], fit: "loose" }));
    expect(readIdeas(sessionStorage)?.sayings).toEqual({});
  });
});