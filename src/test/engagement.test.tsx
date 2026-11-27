import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { TopicLanding } from "@/components/app/TopicLanding";
import { KeptCheckBack } from "@/components/app/KeptCheckBack";
import { KEPT_KEY, MIN_WAIT_MS, readKept, saveKept } from "@/lib/kept";

const mocks = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("@/lib/match-topics.functions", () => ({ getKeptTopic: mocks.load }));
vi.mock("@tanstack/react-router", () => ({ Link: ({ to, params, search, hash, children, ...props }: {
  to: string; params?: { slug: string }; search?: { topic: string }; hash?: string; children: ReactNode;
}) => <a {...props} href={to.replace("$slug", params?.slug ?? "") + (search ? `?topic=${search.topic}` : "") + (hash ? `#${hash}` : "")}>{children}</a> }));
vi.mock("streamdown", () => ({ Streamdown: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
beforeEach(() => { localStorage.clear(); mocks.load.mockReset(); mocks.load.mockResolvedValue({ try_text: "A stored small thing" }); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function checkBack() {
  return render(<QueryClientProvider client={new QueryClient()}><KeptCheckBack /></QueryClientProvider>);
}

describe("Topic fit choices", () => {
  it("saves only after pressing keep and allows changing the answer", () => {
    render(<TopicLanding slug="topic-10" title="A topic" hasDeeper onChoose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "This fits" }));
    expect(readKept()).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Keep this for later" }));
    expect(readKept()).toMatchObject({ slug: "topic-10", title: "A topic" });
    expect(screen.queryByRole("button", { name: "Keep this for later" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Just curious" }));
    expect(screen.getByRole("button", { name: "Just curious" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "This fits" })).toHaveAttribute("aria-pressed", "false");
  });
  it("opens the existing chooser for a partial fit with deeper data", () => {
    const choose = vi.fn();
    render(<TopicLanding slug="topic-10" title="A topic" hasDeeper onChoose={choose} />);
    fireEvent.click(screen.getByRole("button", { name: "Part of it fits" }));
    fireEvent.click(screen.getByRole("button", { name: "See the sayings" }));
    expect(choose).toHaveBeenCalledTimes(1);
    expect(readKept()).toBeNull();
  });
  it("offers a scoped question when there is no deeper layer", () => {
    render(<TopicLanding slug="topic-09" title="A topic" hasDeeper={false} onChoose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Part of it fits" }));
    expect(screen.getByRole("link", { name: "Ask a different question" }).getAttribute("href")).toBe("/ask?topic=topic-09");
  });
  it("offers both question and topic browsing for a poor fit", () => {
    render(<TopicLanding slug="topic-10" title="A topic" hasDeeper onChoose={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Not quite" }));
    expect(screen.getByRole("link", { name: "Ask a different question" }).getAttribute("href")).toBe("/ask?topic=topic-10");
    expect(screen.getByRole("link", { name: "Browse the topics" }).getAttribute("href")).toBe("/about#topics");
  });
});

describe("Home check back", () => {
  it("does not read a topic when nothing is kept", () => {
    checkBack();
    expect(mocks.load).not.toHaveBeenCalled();
  });
  it("does not load or show a recently kept item", () => {
    saveKept({ slug: "topic-10", title: "A topic", at: Date.now() });
    checkBack();
    expect(mocks.load).not.toHaveBeenCalled();
  });
  it.each(["Tried it", "Not yet", "Tried something else"])("keeps the %s answer on the page until Done clears the item", async (label) => {
    saveKept({ slug: "topic-10", title: "A topic", at: Date.now() - MIN_WAIT_MS });
    checkBack();
    fireEvent.click(await screen.findByRole("button", { name: label }));
    expect(mocks.load).toHaveBeenCalledWith({ data: { slug: "topic-10" } });
    expect(readKept()).not.toBeNull();
    expect(screen.getByRole("link", { name: "Look at the topic again" }).getAttribute("href")).toBe("/topic/topic-10");
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: label })).toBeNull());
    expect(localStorage.getItem(KEPT_KEY)).toBeNull();
  });
  it("does not show inactive or missing topic content", async () => {
    mocks.load.mockResolvedValue(null);
    saveKept({ slug: "topic-10", title: "A topic", at: Date.now() - MIN_WAIT_MS });
    checkBack();
    await waitFor(() => expect(mocks.load).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("button", { name: "Tried it" })).toBeNull();
    expect(readKept()).not.toBeNull();
  });
});