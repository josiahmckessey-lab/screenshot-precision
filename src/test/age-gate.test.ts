import { describe, expect, it } from "vitest";
import { canContinueAge } from "@/lib/age-gate";

describe("18+ screen", () => {
  it("stops when the box is unchecked", () => expect(canContinueAge(false)).toBe(false));
  it("continues when checked", () => expect(canContinueAge(true)).toBe(true));
});
