import { describe, expect, it } from "vitest";
import { FRAMEWORK_PARTS, PART_BY_TOPIC } from "@/content/about";

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

  it("maps every topic 1-20 to exactly one part with that part's title", () => {
    expect(Object.keys(PART_BY_TOPIC)).toHaveLength(20);
    for (let topic = 1; topic <= 20; topic += 1) {
      const part = PART_BY_TOPIC[topic];
      if (!part) throw new Error(`topic ${topic} has no part`);
      const owner = FRAMEWORK_PARTS.find((p) => p.number === part.number);
      expect(owner?.topics).toContain(topic);
      expect(part.title).toBe(owner?.title);
    }
  });
});
