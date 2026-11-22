import { describe, expect, it } from "vitest";

import { FALLBACK_TOPICS, parseMatchReply, pickTopicNumbers, sanitizeMatches } from "@/lib/match-topics";

describe("Topic sorter validation", () => {
  it("keeps only whole numbers 1 to 20, at most 3, with no repeats", () => {
    expect(sanitizeMatches([5, 12, 19])).toEqual([5, 12, 19]);
    expect(sanitizeMatches([2, 2, 7, 11, 15, 3])).toEqual([2, 7, 11]);
    expect(sanitizeMatches([0, 21, -4, 4.5, "7", null, 9])).toEqual([9]);
    expect(sanitizeMatches("nope")).toEqual([]);
  });

  it("reads the JSON object out of a reply and rejects anything unusable", () => {
    expect(parseMatchReply('{"matches": [4, 8], "crisis": false}')).toEqual({ matches: [4, 8], sayings: {}, fit: "loose", crisis: false });
    expect(parseMatchReply('Sure! {"matches":[3],"crisis":true} hope that helps')).toEqual({
      matches: [3],
      sayings: {}, fit: "loose",
      crisis: true,
    });
    expect(parseMatchReply("I cannot help with that.")).toBeNull();
    expect(parseMatchReply('{"matches": [99], "crisis": true}')).toBeNull();
    expect(parseMatchReply('{"matches": [], "crisis": true}')).toEqual({ matches: [], sayings: {}, fit: "loose", crisis: true });
  });

  it("reads closest sayings and exact fit, including null saying positions", () => {
    expect(parseMatchReply('{"matches":[{"topic":7,"saying":3},{"topic":2,"saying":null}],"fit":"close","crisis":true}'))
      .toEqual({ matches: [7, 2], sayings: { 7: 3 }, fit: "close", crisis: true });
    expect(parseMatchReply('[4,8]')).toEqual({ matches: [4, 8], sayings: {}, fit: "loose", crisis: false });
  });

  it("filters bad topics, repeats, excess matches and invalid saying positions", () => {
    const reply = JSON.stringify({ matches: [
      { topic: 0, saying: 1 }, { topic: 21, saying: 1 }, { topic: 2.5, saying: 1 }, { topic: "4", saying: 1 },
      { topic: 7, saying: 3 }, { topic: 7, saying: 8 }, { topic: 2, saying: 0 }, { topic: 20, saying: 1.5 }, { topic: 4, saying: 1 },
    ], fit: "Close", crisis: "true" });
    expect(parseMatchReply(reply)).toEqual({ matches: [7, 2, 20], sayings: { 7: 3 }, fit: "loose", crisis: false });
    for (const saying of [-1, 0, 1.5, "2", {}, null]) {
      expect(parseMatchReply(JSON.stringify({ matches: [{ topic: 1, saying }], fit: "loose" }))?.sayings).toEqual({});
    }
  });

  it.each([undefined, null, "CLOSE", "near", true])("defaults invalid fit %s to loose", (fit) => {
    expect(parseMatchReply(JSON.stringify({ matches: [{ topic: 20, saying: 1 }], fit }))?.fit).toBe("loose");
  });

  it("uses server numbers when usable, then on-device keywords, then topics 1, 4 and 8", () => {
    const available = [1, 2, 3, 4, 8, 12];
    expect(pickTopicNumbers({ ok: true, matches: [12, 4] }, "panic", available)).toEqual([12, 4]);
    // Capped or failed call: on-device keywords decide.
    expect(pickTopicNumbers(null, "I feel flooded and cannot breathe", available)).toEqual([4]);
    expect(pickTopicNumbers({ ok: false, matches: [] }, "flooded", available)).toEqual([4]);
    // Nothing anywhere: the fixed starting point.
    expect(pickTopicNumbers(null, "a quiet Tuesday afternoon", available)).toEqual([1, 4, 8]);
    expect(pickTopicNumbers({ ok: true, matches: [77] }, "a quiet Tuesday afternoon", available)).toEqual([1, 4, 8]);
  });

  it("keeps the fixed starting point at topics 1, 4 and 8", () => {
    expect([...FALLBACK_TOPICS]).toEqual([1, 4, 8]);
  });
});
