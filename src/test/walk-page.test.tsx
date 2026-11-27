import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { routeTree } from "@/routeTree.gen";
import { readWalkStep, saveWalkStep } from "@/lib/walk";

const mocks = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("@/lib/walk-load", () => ({ loadWalk: mocks.load }));
vi.mock("streamdown", () => ({ Streamdown: ({ children }: { children: ReactNode }) => <div>{children}</div> }));

const options = [0, 1, 2].map((n) => ({ label: `Answer ${n}`, reply: `Reply ${n}` }));
const items = Array.from({ length: 20 }, (_, i) => ({
  topic_number: i + 1, slug: `topic-${String(i + 1).padStart(2, "0")}`, title: `Topic ${i + 1}`,
  picture: `Picture ${i + 1}`, sentence: `Sentence ${i + 1}`, question: `Question ${i + 1}`, options,
}));

beforeEach(() => { localStorage.clear(); mocks.load.mockReset(); mocks.load.mockResolvedValue(items); });
afterEach(cleanup);

async function open(path: string) {
  routeTree.update({ component: Outlet });
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() }, history: createMemoryHistory({ initialEntries: [path] }) });
  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}

describe("Guided walk", () => {
  it("shows the entry screen with Begin when no step is given", async () => {
    await open("/walk");
    expect(await screen.findByRole("heading", { level: 1, name: "Walk the whole path" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Begin" }).getAttribute("href")).toBe("/walk?step=1");
    expect(screen.queryByRole("link", { name: "Continue" })).toBeNull();
  });
  it("offers Continue when a later step is saved on the device", async () => {
    saveWalkStep(6);
    await open("/walk");
    expect((await screen.findByRole("link", { name: "Continue" })).getAttribute("href")).toBe("/walk?step=6");
    expect(screen.getByRole("link", { name: "Start from the beginning" }).getAttribute("href")).toBe("/walk?step=1");
    expect(screen.queryByRole("link", { name: "Begin" })).toBeNull();
  });
  it.each(["/walk?step=0", "/walk?step=21", "/walk?step=abc"])("treats %s as a missing step", async (path) => {
    await open(path);
    expect(await screen.findByRole("heading", { level: 1, name: "Walk the whole path" })).toBeTruthy();
  });
  it("returns to the entry screen when the step has no stored picture", async () => {
    mocks.load.mockResolvedValue(items.slice(0, 2));
    await open("/walk?step=5");
    expect(await screen.findByRole("heading", { level: 1, name: "Walk the whole path" })).toBeTruthy();
  });
  it("shows the reply and the next buttons only after an answer, with no count", async () => {
    await open("/walk?step=3");
    expect(await screen.findByRole("heading", { level: 1, name: "Topic 3" })).toBeTruthy();
    expect(screen.getByText("Question 3")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Next" })).toBeNull();
    expect(screen.queryByText("Reply 1")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Answer 1" }));
    expect(screen.getByText("Reply 1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Answer 2" }));
    expect(screen.queryByText("Reply 1")).toBeNull();
    expect(screen.getByRole("button", { name: "Answer 2" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Read this topic" }).getAttribute("href")).toBe("/topic/topic-03");
    expect(document.body.textContent).not.toMatch(/\b3\s*(of|\/)\s*20\b|%/);
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(readWalkStep()).toBeNull();
  });
  it("saves the next step when Next is pressed", async () => {
    const router = await open("/walk?step=3");
    fireEvent.click(await screen.findByRole("button", { name: "Answer 0" }));
    fireEvent.click(screen.getByRole("link", { name: "Next" }));
    await waitFor(() => expect(router.state.location.search).toEqual({ step: 4 }));
    expect(readWalkStep()).toBe(4);
    expect(await screen.findByRole("heading", { level: 1, name: "Topic 4" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Next" })).toBeNull();
  });
  it("moves from step 20 to the done screen and clears the saved step", async () => {
    saveWalkStep(20);
    const router = await open("/walk?step=20");
    fireEvent.click(await screen.findByRole("button", { name: "Answer 0" }));
    fireEvent.click(screen.getByRole("link", { name: "Next" }));
    await waitFor(() => expect(router.state.location.search).toEqual({ done: true }));
    expect(await screen.findByRole("heading", { level: 1, name: "That is the whole path." })).toBeTruthy();
    await waitFor(() => expect(readWalkStep()).toBeNull());
    expect(screen.getAllByRole("link", { name: "Find a guide" }).map((a) => a.getAttribute("href"))).toEqual(["/guide", "/guide"]);
    expect(screen.getByRole("link", { name: "Browse the topics" }).getAttribute("href")).toBe("/about#topics");
    expect(screen.getByRole("link", { name: "Walk it again" }).getAttribute("href")).toBe("/walk?step=1");
  });
  it("renders the options that exist when a row has fewer than three", async () => {
    mocks.load.mockResolvedValue([{ ...items[0], options: options.slice(0, 2) }]);
    await open("/walk?step=1");
    expect(await screen.findByRole("button", { name: "Answer 0" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Answer 1" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Answer 2" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Answer 1" }));
    expect(screen.getByText("Reply 1")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Next" }).getAttribute("href")).toBe("/walk?done=true");
  });
});
