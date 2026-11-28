import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { IDEAS_FRESH_KEY, markIdeasFresh, saveIdeas } from "@/lib/ideas-session";
import { IDEAS_LEAD_CLOSE, IDEAS_LEAD_LOOSE } from "@/lib/brand";
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
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

function reduceMotion() {
  const original = window.matchMedia;
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({ ...original(query), matches: query === "(prefers-reduced-motion: reduce)" }));
}

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

describe("Results lead in line", () => {
  it.each([["close", IDEAS_LEAD_CLOSE], ["loose", IDEAS_LEAD_LOOSE]] as const)("shows the %s text under the quote and above the cards", async (fit, lead) => {
    saveIdeas(sessionStorage, { text: "a habit", matches: [5], sayings: {}, fit, crisis: false });
    await open();
    const line = await screen.findByText(lead);
    const other = fit === "close" ? IDEAS_LEAD_LOOSE : IDEAS_LEAD_CLOSE;
    expect(screen.queryByText(other)).toBeNull();
    const quote = screen.getByText("a habit");
    const cards = screen.getByTestId("idea-cards");
    expect(quote.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(line.compareDocumentPosition(cards) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.querySelectorAll('main svg[role="img"]').length).toBe(1);
  });

  it("shows the full line and the cards at once on a return visit", async () => {
    saveIdeas(sessionStorage, { text: "a habit", matches: [5], sayings: {}, fit: "close", crisis: false });
    await open();
    const line = await screen.findByText(IDEAS_LEAD_CLOSE);
    expect(line).not.toHaveClass("sr-only");
    expect(screen.queryByTestId("typing-cursor")).toBeNull();
    expect(screen.getByTestId("idea-cards")).not.toHaveClass("opacity-0");
  });

  it("with reduced motion shows the text in full immediately, even for a fresh result", async () => {
    reduceMotion();
    saveIdeas(sessionStorage, { text: "a habit", matches: [5], sayings: {}, fit: "loose", crisis: false });
    markIdeasFresh(sessionStorage);
    await open();
    const line = await screen.findByText(IDEAS_LEAD_LOOSE);
    expect(line).not.toHaveClass("sr-only");
    expect(screen.queryByTestId("typing-cursor")).toBeNull();
    expect(screen.getByTestId("idea-cards")).not.toHaveClass("opacity-0");
    expect(sessionStorage.getItem(IDEAS_FRESH_KEY)).toBeNull();
  });

  it("types a fresh result one character at a time, keeps the full text for screen readers, then fades the cards in", async () => {
    saveIdeas(sessionStorage, { text: "a habit", matches: [5], sayings: {}, fit: "close", crisis: false });
    markIdeasFresh(sessionStorage);
    await open();
    const full = await screen.findByText(IDEAS_LEAD_CLOSE);
    expect(full).toHaveClass("sr-only");
    const typed = screen.getByTestId("typed-line");
    expect(typed).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("typing-cursor")).toBeInTheDocument();
    expect(screen.getByTestId("idea-cards")).toHaveClass("opacity-0");
    await waitFor(() => expect(screen.queryByTestId("typing-cursor")).toBeNull(), { timeout: 4000 });
    expect(screen.getByText(IDEAS_LEAD_CLOSE)).not.toHaveClass("sr-only");
    expect(screen.getByTestId("idea-cards")).toHaveClass("cards-fade-in");
    expect(sessionStorage.getItem(IDEAS_FRESH_KEY)).toBeNull();
  });
});
