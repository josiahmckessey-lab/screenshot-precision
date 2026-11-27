import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearWalkStep, readWalkStep, saveWalkStep, validateWalkSearch, WALK_KEY } from "@/lib/walk";
import { parseWalkOptions } from "@/lib/walk-load";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("Walk step kept on the device", () => {
  it("reads a valid step", () => {
    localStorage.setItem(WALK_KEY, JSON.stringify({ step: 7 }));
    expect(readWalkStep()).toBe(7);
  });
  it.each([null, [], {}, 7, "7", { step: "7" }, { step: 0 }, { step: 21 }, { step: 2.5 }, { step: -1 }, { step: 3, extra: true }])("rejects wrong shape %s", (value) => {
    localStorage.setItem(WALK_KEY, JSON.stringify(value));
    expect(readWalkStep()).toBeNull();
  });
  it("returns null for bad JSON", () => {
    localStorage.setItem(WALK_KEY, "{");
    expect(readWalkStep()).toBeNull();
  });
  it("returns null for empty storage", () => expect(readWalkStep()).toBeNull());
  it("saves only the step number and clears it", () => {
    expect(saveWalkStep(4)).toBe(true);
    expect(JSON.parse(localStorage.getItem(WALK_KEY) ?? "null")).toEqual({ step: 4 });
    expect(saveWalkStep(21)).toBe(false);
    expect(clearWalkStep()).toBe(true);
    expect(localStorage.getItem(WALK_KEY)).toBeNull();
  });
  it("never throws if device storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(readWalkStep()).toBeNull();
    expect(saveWalkStep(3)).toBe(false);
    expect(clearWalkStep()).toBe(false);
  });
});

describe("Walk address values", () => {
  it("keeps whole steps from 1 to 20 and the done flag", () => {
    expect(validateWalkSearch({ step: 1 })).toEqual({ step: 1 });
    expect(validateWalkSearch({ step: "20" })).toEqual({ step: 20 });
    expect(validateWalkSearch({ done: true })).toEqual({ done: true });
  });
  it.each([0, 21, 2.5, -3, "two", null, true])("drops step %s", (step) => {
    expect(validateWalkSearch({ step })).toEqual({});
  });
  it("drops a done flag that is not true", () => expect(validateWalkSearch({ done: false })).toEqual({}));
});

describe("Stored walk options", () => {
  it("keeps only complete options", () => {
    expect(parseWalkOptions([{ label: "A", reply: "B" }, { label: "C" }, null, "x", { label: "", reply: "D" }])).toEqual([{ label: "A", reply: "B" }]);
    expect(parseWalkOptions("none")).toEqual([]);
  });
});
