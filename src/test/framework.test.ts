import { describe, expect, it } from "vitest";
import { FRAMEWORK_PARTS } from "@/content/about";

describe("Framework topic order", () => {
  it.each([
    [1, [4, 2, 1, 11]],
    [2, [5, 7, 6, 17, 18]],
    [3, [3, 12, 10, 9]],
    [4, [13, 14, 20]],
    [5, [8, 19]],
    [6, [16, 15]],
  ])("keeps part %s topics in the requested order", (number, topics) => {
    expect(FRAMEWORK_PARTS.find((part) => part.number === number)?.topics).toEqual(topics);
  });
});