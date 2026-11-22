import { describe, expect, it } from "vitest";
import { readingLane, validateTopicSearch } from "@/lib/topic-screen";

describe("Reading lane restoration", () => {
  it.each([0, 1, 2, 3])("restores read=%s", (read) => {
    const state = validateTopicSearch({ read: String(read) });
    expect(readingLane(state.read, false, false, false).depth).toBe(read);
  });
  it("validates reading limits and flags", () => {
    expect(validateTopicSearch({ read: 99, chooser: "true" })).toMatchObject({ read: 3, chooser: true });
    expect(validateTopicSearch({ read: -2, chooser: "false" })).toMatchObject({ read: 0, chooser: false });
    expect(validateTopicSearch({ read: "invalid" }).read).toBe(0);
  });
  it("waits for a fit decision after level one only when deeper data exists", () => {
    expect(readingLane(1, true, false, false).canRead).toBe(false);
    expect(readingLane(1, true, true, false).canRead).toBe(true);
    expect(readingLane(1, false, false, false).canRead).toBe(true);
    expect(readingLane(3, false, false, false).canRead).toBe(false);
  });
  it("retains an opened chooser and reading depth together", () => {
    const state = validateTopicSearch({ read: 2, chooser: true, all: true, words: true, scripture: true, verses: true });
    expect(readingLane(state.read, true, false, state.chooser)).toEqual({ depth: 2, showFit: true, canRead: false });
    expect(state).toMatchObject({ all: true, words: true, scripture: true, verses: true });
  });
});