import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { invitedFaith, loadInstruction, loadReplyLibrary, routingSchema } from "@/lib/chat-library.server";
import { chatInputSchema } from "@/lib/chat-contract";

const row = (kind: string, entry_number: number | null, body: string, extra = {}) => ({ kind, entry_number, body, slug: null, id: "", story_number: null, status: "active", faith_layer: false, ...extra });
function database(rows: ReturnType<typeof row>[]) {
  const reads: { column: string; values: unknown[] }[][] = [];
  const client = { from: () => {
    const filters: { column: string; values: unknown[] }[] = [];
    reads.push(filters);
    const query = {
      select: () => query,
      eq: (column: string, value: unknown) => { filters.push({ column, values: [value] }); return query; },
      in: (column: string, values: unknown[]) => { filters.push({ column, values }); return query; },
      result: () => rows.filter(r => filters.every(f => f.values.includes((r as Record<string, unknown>)[f.column]))),
      single: async () => { const matches = query.result(); return { data: matches.length === 1 ? matches[0] : null, error: matches.length === 1 ? null : new Error("missing") }; },
      maybeSingle: async () => ({ data: query.result()[0] ?? null, error: null }),
      then: (resolve: (r: unknown) => unknown) => Promise.resolve({ data: query.result(), error: null }).then(resolve),
    };
    return query;
  } } as unknown as SupabaseClient<Database>;
  return { client, reads };
}
const route = { mode: "full" as const, entries: [1, 2, 3], story_id: "story-1" };
const settings = { verse_on: false, story_on: true };
const rows = [row("entry", 1, "one"), row("entry", 2, "two"), row("entry", 3, "three"), row("entry", 4, "steady"), row("entry_faith", 1, "faith-one"), row("entry_deep", 1, "deep-one"), row("entry_deep", 2, "deep-two")];

describe("Private library selection", () => {
  it.each(["core", "index"] as const)("loads only the row with slug %s", async slug => {
    const { client } = database([row(slug, null, "wrong-row"), row("other", null, "selected", { slug })]);
    expect(await loadInstruction(client, slug)).toBe("selected");
  });
  it("routes at most three entries and one nullable story identifier", () => {
    expect(routingSchema.safeParse(route).success).toBe(true);
    expect(routingSchema.safeParse({ ...route, entries: [1, 2, 3, 4] }).success).toBe(false);
    expect(routingSchema.safeParse({ ...route, story_id: ["a", "b"] }).success).toBe(false);
  });
  it("loads chosen entry rows only", async () => {
    expect((await loadReplyLibrary(database(rows).client, route, settings, false, undefined)).library).toBe("one\ntwo\nthree");
  });
  it("rejects inactive stories", async () => {
    const db = database([...rows, row("story", null, "inactive", { story_number: "story-1", status: "draft" })]);
    expect((await loadReplyLibrary(db.client, route, settings, true, undefined)).hasStory).toBe(false);
  });
  it("includes an active non-faith story", async () => {
    const db = database([...rows, row("story", null, "story-body", { story_number: "story-1" })]);
    expect((await loadReplyLibrary(db.client, route, settings, false, undefined)).library).toBe("one\ntwo\nthree\nstory-body");
  });
  it("never allows a faith story from the verse switch alone", async () => {
    const db = database([...rows, row("story", null, "faith-story", { story_number: "story-1", faith_layer: true })]);
    expect((await loadReplyLibrary(db.client, route, { ...settings, verse_on: true }, false, undefined)).hasStory).toBe(false);
  });
  it.each(["God", "prayer", "church", "Scripture"])("allows active faith stories when %s is mentioned", async word => {
    const db = database([...rows, row("story", null, "faith-story", { story_number: "story-1", faith_layer: true })]);
    const selected = await loadReplyLibrary(db.client, route, settings, invitedFaith(`I mentioned ${word}.`), undefined);
    expect(selected.faithStory).toBe(true);
    expect(selected.library).toContain("faith-story");
  });
  it.each(["faith", "spirituality", "Bible", "Jesus"])("does not treat %s as the specified story invitation", word => {
    expect(invitedFaith(word)).toBe(false);
  });
  it.each([{ verse: true, invitation: false }, { verse: false, invitation: true }])("loads faith entries when verse=$verse or invitation=$invitation", async ({ verse, invitation }) => {
    const selected = await loadReplyLibrary(database(rows).client, route, { ...settings, verse_on: verse }, invitation, undefined);
    expect(selected.library).toContain("faith-one");
  });
  it("does not load faith entries without opt-in or invitation", async () => {
    expect((await loadReplyLibrary(database(rows).client, route, settings, false, undefined)).library).not.toContain("faith-one");
  });
  it.each([2, 3] as const)("loads only the requested entry's deep material at level %s", async level => {
    const selected = await loadReplyLibrary(database(rows).client, route, settings, false, { entryNumber: 1, level });
    expect(selected.entries).toEqual([1]);
    expect(selected.library).toBe("one\ndeep-one");
  });
  it("does not load deep material at level 1", async () => {
    expect((await loadReplyLibrary(database(rows).client, route, settings, false, { entryNumber: 1, level: 1 })).library).toBe("one");
  });
  it("steady loads only entry 4 and never a story, faith supplement, or deep supplement", async () => {
    const db = database([...rows, row("entry_faith", 4, "faith-four"), row("entry_deep", 4, "deep-four"), row("story", null, "story", { story_number: "story-1" })]);
    const selected = await loadReplyLibrary(db.client, { ...route, mode: "steady" }, { verse_on: true, story_on: true }, true, { entryNumber: 4, level: 3 });
    expect(selected.library).toBe("steady");
    expect(selected.entries).toEqual([4]);
    expect(selected.hasStory).toBe(false);
    expect(db.reads).toHaveLength(1);
  });
  it("accepts levels 1, 2, 3 and rejects a fourth level", () => {
    for (const level of [1, 2, 3]) expect(chatInputSchema.safeParse({ message: "more", knowMore: { entryNumber: 1, level } }).success).toBe(true);
    expect(chatInputSchema.safeParse({ message: "more", knowMore: { entryNumber: 1, level: 4 } }).success).toBe(false);
  });
});