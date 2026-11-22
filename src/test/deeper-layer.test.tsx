import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "@/routeTree.gen";
import { loadDeeper, parseDeeper, type DeeperData } from "@/lib/deeper";
import type { Database } from "@/integrations/supabase/types";
import { DEEPER_OPEN, DEEPER_NONE, DEEPER_FITS, BACK_LABEL, KEEP_READING_LABEL, DEEPER_OTHER } from "@/lib/brand";

const mocks = vi.hoisted(() => ({ from: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn(), related: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: mocks.from } }));
type Row = Database["public"]["Tables"]["library_deeper"]["Row"];
const row: Row = {
  topic_number: 10, chooser_heading: "Which is closest?", status: "active", version: "v0.1",
  entries: [
    { position: 2, saying: "I push away help, even good help.", what: "Accepting help can feel like giving up control.", try: "Take one small piece of help.", sure_label: "Established", sure_note: "Reactance: Brehm (1966)." },
    { position: 1, saying: "I don't let anyone push me around.", what: "That can be a strength that kept a person safe for a long time.", try: "Pick one place with a real say.", sure_label: "Established", sure_note: "Brehm (1966)." },
  ],
  reach_beyond: { heading: "Beyond this page", lines: ["A person can reach beyond a library."] },
  words: [{ term: "Reactance", def: "Protecting a threatened freedom." }], also_related: [15, 9, 12, 13],
};
const data: DeeperData = { ...parseDeeper(row), related: [{ title: "A related topic", slug: "topic-15" }] };

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
beforeEach(() => {
  mocks.eq.mockReset(); mocks.maybeSingle.mockReset(); mocks.related.mockReset();
  mocks.from.mockImplementation((table: string) => ({ select: () => table === "library_deeper"
    ? { eq: mocks.eq }
    : { in: () => ({ eq: mocks.related }), eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { slug: "topic-10", title: "Topic ten", picture: "A picture", sentence: "A sentence", level1: "", level2: "", level3: "", try_text: "A small step", scripture: [] }, error: null }) }) }) } }));
  mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
  mocks.related.mockResolvedValue({ data: [], error: null });
});

async function openLayer(path = "/topic/topic-10") {
  mocks.maybeSingle.mockResolvedValue({ data: row, error: null });
  routeTree.update({ component: Outlet });
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() }, history: createMemoryHistory({ initialEntries: [path] }) });
  await router.load();
  const view = render(<RouterProvider router={router} />);
  return { ...view, router };
}

describe("Optional deeper data", () => {
  it("loads topic 10 and preserves related topic order", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: row, error: null });
    mocks.related.mockResolvedValue({ data: [13, 12, 9, 15].map((n) => ({ topic_number: n, title: String(n), slug: `topic-${n}` })), error: null });
    const loaded = await loadDeeper("topic-10");
    expect(mocks.eq).toHaveBeenCalledWith("topic_number", 10);
    expect(loaded?.entries.map((e) => e.position)).toEqual([1, 2]);
    expect(loaded?.related.map((p) => p.slug)).toEqual(["topic-15", "topic-9", "topic-12", "topic-13"]);
  });
  it("returns no extra layer for a missing topic row", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    expect(await loadDeeper("topic-9")).toBeNull();
    expect(mocks.related).not.toHaveBeenCalled();
  });
  it("returns no extra layer when the optional query fails", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: { message: "failed" } });
    expect(await loadDeeper("topic-10")).toBeNull();
    mocks.maybeSingle.mockRejectedValue(new Error("offline"));
    expect(await loadDeeper("topic-10")).toBeNull();
  });
  it("keeps the layer usable when related links cannot load", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: row, error: null });
    mocks.related.mockRejectedValue(new Error("offline"));
    expect((await loadDeeper("topic-10"))?.entries).toHaveLength(2);
  });
});

describe("Specific topic choices", () => {
  it("keeps reaching beyond closed until opened without navigating or losing the chooser", async () => {
    const { router } = await openLayer("/topic/topic-10?read=1&chooser=true");
    const before = router.state.location.href;
    const trigger = screen.getByRole("button", { name: data.reach_beyond.heading });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("A person can reach beyond a library.")).toBeNull();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("A person can reach beyond a library.")).toBeVisible();
    expect(router.state.location.href).toBe(before);
    fireEvent.click(trigger);
    expect(screen.queryByText("A person can reach beyond a library.")).toBeNull();
  });
  it("reveals level one before the fit check and navigates back to the exact chooser", async () => {
    const store = vi.spyOn(Storage.prototype, "setItem");
    const { router } = await openLayer();
    expect(screen.queryByRole("button", { name: DEEPER_OPEN })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: KEEP_READING_LABEL }));
    fireEvent.click(await screen.findByRole("button", { name: DEEPER_OPEN }));
    const first = data.entries[0];
    if (!first) throw new Error("An entry is required");
    fireEvent.click(await screen.findByRole("link", { name: `“${first.saying}”` }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/topic/topic-10/more/1"));
    await screen.findByRole("heading", { name: first.saying });
    expect(screen.queryByRole("link", { name: DEEPER_NONE })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: DEEPER_OTHER }));
    await screen.findByRole("link", { name: DEEPER_NONE });
    expect(router.state.location.search).toMatchObject({ others: true });
    fireEvent.click(screen.getByRole("button", { name: BACK_LABEL }));
    await screen.findByRole("link", { name: `“${first.saying}”` });
    expect(router.state.location.pathname).toBe("/topic/topic-10");
    expect(router.state.location.search).toMatchObject({ read: 1, chooser: true });
    expect(router.history.location.state.__TSR_index).toBe(0);
    expect(store).not.toHaveBeenCalled();
  });
  it("opens the dedicated endpoint page and returns to the chooser", async () => {
    const { router } = await openLayer("/topic/topic-10?read=1&chooser=true");
    fireEvent.click(await screen.findByRole("link", { name: DEEPER_NONE }));
    await screen.findByRole("button", { name: BACK_LABEL });
    expect(router.state.location.pathname).toBe("/topic/topic-10/more/none");
    expect(router.state.matches.at(-1)?.routeId).toBe("/topic/$slug_/more/none");
    fireEvent.click(screen.getByRole("button", { name: BACK_LABEL }));
    await screen.findByRole("link", { name: DEEPER_NONE });
    expect(router.state.location.search).toMatchObject({ chooser: true, read: 1 });
  });
  it.each(["1", "none"])("uses the parent chooser as a direct arrival fallback for %s", async (position) => {
    const { router } = await openLayer(`/topic/topic-10/more/${position}`);
    fireEvent.click(await screen.findByRole("link", { name: BACK_LABEL }));
    await screen.findByRole("link", { name: DEEPER_NONE });
    expect(router.state.location.pathname).toBe("/topic/topic-10");
    expect(router.state.location.search).toMatchObject({ chooser: true, read: 1 });
    expect(router.history.location.state.__TSR_index).toBe(0);
  });
  it.each(["999", "01", "not-a-position"])("redirects nonexistent position %s to the topic", async (position) => {
    const { router } = await openLayer(`/topic/topic-10/more/${position}`);
    await waitFor(() => expect(router.state.location.pathname).toBe("/topic/topic-10"));
    await screen.findByRole("button", { name: KEEP_READING_LABEL });
  });
  it.each(["1", "none"])("redirects %s when the topic has no deeper row", async (position) => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });
    routeTree.update({ component: Outlet });
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() }, history: createMemoryHistory({ initialEntries: [`/topic/topic-9/more/${position}`] }) });
    await router.load();
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(router.state.location.pathname).toBe("/topic/topic-9"));
    expect(screen.queryByRole("button", { name: DEEPER_OPEN })).toBeNull();
  });
  it("continues reading after accepting the fit without adding history entries", async () => {
    const { router } = await openLayer("/topic/topic-10?read=1");
    fireEvent.click(await screen.findByRole("button", { name: DEEPER_FITS }));
    fireEvent.click(await screen.findByRole("button", { name: KEEP_READING_LABEL }));
    await waitFor(() => expect(router.state.location.search).toMatchObject({ read: 2, fits: true }));
    fireEvent.click(screen.getByRole("button", { name: KEEP_READING_LABEL }));
    await waitFor(() => expect(router.state.location.search).toMatchObject({ read: 3 }));
    expect(screen.queryByRole("button", { name: KEEP_READING_LABEL })).toBeNull();
    expect(router.history.location.state.__TSR_index).toBe(0);
  });
  it("restores reading level three on direct arrival", async () => {
    const { router } = await openLayer("/topic/topic-10?read=3");
    expect(router.state.location.search).toMatchObject({ read: 3 });
    expect(screen.queryByRole("button", { name: KEEP_READING_LABEL })).toBeNull();
    expect(screen.queryByRole("button", { name: DEEPER_OPEN })).toBeNull();
  });
  it("reveals the remaining sayings without losing the chooser on back", async () => {
    const extraRow = { ...row, entries: [...data.entries, ...[3, 4, 5, 6].map((position) => ({ ...data.entries[0], position, saying: `Saying ${position}` }))] };
    const { router } = await openLayer("/topic/topic-10?read=1&chooser=true");
    mocks.maybeSingle.mockResolvedValue({ data: extraRow, error: null });
    await act(async () => { await router.invalidate(); });
    await waitFor(() => expect(router.state.matches.at(-1)?.loaderData).toBeDefined());
    await screen.findByRole("button", { name: "Show all 6 sayings" });
    expect(screen.queryByRole("link", { name: "“Saying 5”" })).toBeNull();
    expect(screen.queryByRole("link", { name: "“Saying 6”" })).toBeNull();
    expect(screen.getByRole("link", { name: "“Saying 4”" })).toBeTruthy();
    expect(screen.getByRole("link", { name: DEEPER_NONE })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Show all 6 sayings" }));
    fireEvent.click(await screen.findByRole("link", { name: "“Saying 6”" }));
    await screen.findByRole("heading", { name: "Saying 6" });
    fireEvent.click(screen.getByRole("button", { name: BACK_LABEL }));
    await screen.findByRole("link", { name: "“Saying 6”" });
    expect(router.state.location.search).toMatchObject({ all: true, chooser: true });
  });
});
