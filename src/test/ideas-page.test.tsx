import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { saveIdeas } from "@/lib/ideas-session";
import { readStoredSayings } from "@/lib/match-topics";

const entry = { position: 3, saying: "A stored saying", what: "Stored explanation", try: "Stored practice", sure_label: "Strong", sure_note: "Stored note" };
vi.mock("@/lib/match-topics.functions", () => ({
  match_topics: vi.fn(),
  getIdeasLibrary: async () => ({ topics: [{ slug: "topic-05", topic_number: 5, title: "A topic", sentence: "A sentence", home_line: "A question" }], deeper: [{ topic_number: 5, entries: [{ position: 3, saying: "A stored saying" }] }] }),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: {
  topic_number: 5, chooser_heading: "Sayings", entries: [{ position: 3, saying: "A stored saying", what: "Stored explanation", try: "Stored practice", sure_label: "Strong", sure_note: "Stored note" }], reach_beyond: {}, words: [], also_related: [],
}, error: null }) }) }) }) } }));
beforeEach(() => sessionStorage.clear());
afterEach(cleanup);

async function open() {
  routeTree.update({ component: Outlet });
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() }, history: createMemoryHistory({ initialEntries: ["/ideas"] }) });
  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}

describe("Closest stored saying results", () => {
  it("links a valid stored position to the same saying route as the chooser", async () => {
    saveIdeas(sessionStorage, { text: "a habit", matches: [5], sayings: { 5: 3 }, fit: "close", crisis: false });
    const router = await open();
    fireEvent.click(await screen.findByRole("link", { name: "A stored saying" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/topic/topic-05/more/3"));
    expect(router.state.matches.at(-1)?.routeId).toBe("/topic/$slug_/more/$position");
  });
  it.each([{}, { 5: 999 }])("does not create a saying link for missing entries %s", async (sayings) => {
    saveIdeas(sessionStorage, { text: "a habit", matches: [5], sayings, fit: "loose", crisis: false });
    await open();
    await screen.findByRole("heading", { name: "A topic" });
    expect(screen.queryByRole("link", { name: "A stored saying" })).toBeNull();
  });
  it("projects only stored text and validates positions", () => {
    expect(readStoredSayings([entry, { position: 0, saying: "invalid" }, { position: 2.5, saying: "invalid" }, { position: 1, saying: 7 }])).toEqual([{ position: 3, saying: "A stored saying" }]);
  });
});