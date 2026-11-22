import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DeeperLayer } from "@/components/app/DeeperLayer";
import { loadDeeper, parseDeeper, type DeeperData } from "@/lib/deeper";
import type { Database } from "@/integrations/supabase/types";
import { DEEPER_OPEN, DEEPER_NONE, DEEPER_FITS, DEEPER_WORDS } from "@/lib/brand";

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
    : { in: () => ({ eq: mocks.related }) } }));
  mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
  mocks.related.mockResolvedValue({ data: [], error: null });
});

async function openLayer() {
  const root = createRootRoute({ component: () => <DeeperLayer data={data} /> });
  const router = createRouter({ routeTree: root, history: createMemoryHistory({ initialEntries: ["/"] }) });
  await router.load();
  return render(<RouterProvider router={router} />);
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
  it("replaces an entry on selection without moving focus or writing device storage", async () => {
    const store = vi.spyOn(Storage.prototype, "setItem");
    const view = await openLayer();
    expect(screen.queryByRole("button", { name: DEEPER_NONE })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: DEEPER_OPEN }));
    const first = screen.getByRole("button", { name: `“${data.entries[0]?.saying}”` });
    first.focus(); fireEvent.click(first);
    expect(first).toHaveAttribute("aria-pressed", "true");
    expect(document.activeElement).toBe(first);
    const live = view.container.querySelector('[aria-live="polite"]');
    expect(live).toHaveTextContent("That can be a strength that kept a person safe for a long time.");
    const second = screen.getByRole("button", { name: `“${data.entries[1]?.saying}”` });
    second.focus(); fireEvent.click(second);
    expect(first).toHaveAttribute("aria-pressed", "false");
    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(document.activeElement).toBe(second);
    expect(live).toHaveTextContent("Accepting help can feel like giving up control.");
    expect(live).not.toHaveTextContent("That can be a strength that kept a person safe for a long time.");
    fireEvent.click(screen.getByRole("button", { name: DEEPER_NONE }));
    expect(second).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: DEEPER_NONE })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: DEEPER_WORDS })).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: DEEPER_WORDS }));
    expect(screen.getByRole("button", { name: DEEPER_WORDS })).toHaveAttribute("aria-expanded", "true");
    expect(store).not.toHaveBeenCalled();
  });
  it("ends the chooser path after accepting the initial fit", async () => {
    await openLayer();
    fireEvent.click(screen.getByRole("button", { name: DEEPER_FITS }));
    expect(screen.queryByRole("button", { name: DEEPER_OPEN })).toBeNull();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/about#topics");
  });
  it("resets selection after the component is unmounted", async () => {
    const view = await openLayer();
    fireEvent.click(screen.getByRole("button", { name: DEEPER_OPEN }));
    fireEvent.click(screen.getByRole("button", { name: DEEPER_NONE }));
    view.unmount();
    await openLayer();
    expect(screen.getByRole("button", { name: DEEPER_OPEN })).toBeTruthy();
    expect(screen.queryByRole("button", { name: DEEPER_NONE })).toBeNull();
  });
});