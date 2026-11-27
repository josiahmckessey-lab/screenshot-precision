import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { clearKept, isKeptReady, KEPT_KEY, MIN_WAIT_MS, readKept, saveKept } from "@/lib/kept";

const now = 1800000000000;
const item = { slug: "topic-10", title: "A topic", at: now };
beforeEach(() => { localStorage.clear(); vi.spyOn(Date, "now").mockReturnValue(now); });
afterEach(() => vi.restoreAllMocks());

describe("One device only kept item", () => {
  it("reads a valid item", () => {
    localStorage.setItem(KEPT_KEY, JSON.stringify(item));
    expect(readKept()).toEqual(item);
  });
  it.each([null, [], {}, { ...item, slug: "../guide" }, { ...item, title: "" }, { ...item, at: "now" }, { ...item, at: -1 }, { ...item, at: 1.5 }, { ...item, at: now + 1 }, { ...item, extra: true }])("rejects odd shape %s", (value) => {
    localStorage.setItem(KEPT_KEY, JSON.stringify(value));
    expect(readKept()).toBeNull();
  });
  it("returns null for bad JSON", () => {
    localStorage.setItem(KEPT_KEY, "{");
    expect(readKept()).toBeNull();
  });
  it("returns null for empty storage", () => expect(readKept()).toBeNull());
  it("replaces the earlier item and stores only slug title and time", () => {
    expect(saveKept(item)).toBe(true);
    const next = { slug: "topic-05", title: "Another topic", at: now };
    expect(saveKept(next)).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEPT_KEY) ?? "null")).toEqual(next);
    expect(localStorage.length).toBe(1);
  });
  it("clears the item without touching other device flags", () => {
    localStorage.setItem("daybreak-adult-v1", "true");
    saveKept(item);
    expect(clearKept()).toBe(true);
    expect(readKept()).toBeNull();
    expect(localStorage.getItem("daybreak-adult-v1")).toBe("true");
  });
  it("never shows an item younger than one hour", () => {
    expect(MIN_WAIT_MS).toBe(3600000);
    expect(isKeptReady(item, now + 3599999)).toBe(false);
  });
  it("shows an item at least one hour old", () => {
    expect(isKeptReady(item, now + 3600000)).toBe(true);
  });
  it("never throws if device storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(readKept()).toBeNull();
    expect(saveKept(item)).toBe(false);
    expect(clearKept()).toBe(false);
  });
});