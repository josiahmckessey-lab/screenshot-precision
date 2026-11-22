import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STARTER_QUESTIONS } from "@/content/starter-questions";
import { QUESTION_ERROR } from "@/lib/brand";
import type { ReactNode } from "react";

const actions = vi.hoisted(() => ({ insert: vi.fn(), rpc: vi.fn(), sorter: vi.fn(), navigate: vi.fn(), save: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => actions.sorter }));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => actions.navigate,
  useLocation: () => ({ pathname: "/" }),
  Link: ({ to, params, children }: { to: string; params?: { slug: string }; children: ReactNode }) =>
    <a href={params ? `/topic/${params.slug}` : to} onClick={(event) => event.preventDefault()}>{children}</a>,
}));
vi.mock("@/lib/match-topics.functions", () => ({ match_topics: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      insert: actions.insert,
      select: () => ({ eq: () => Promise.resolve({ data: [{ topic_number: 4 }] }) }),
    }),
    rpc: actions.rpc,
  },
}));
vi.mock("@/lib/ideas-session", () => ({ saveIdeas: actions.save }));

import { QuestionBox } from "@/components/app/QuestionBox";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Starter question behavior", () => {
  it.each([
    ["Why can understanding something and changing it be two different things?", "topic-02"],
    ["What does it mean that a person is a seed, not a stamp or clay?", "topic-13"],
    ["Why can a good thing feel less safe than a familiar hard one?", "topic-01"],
    ["What is the difference between wanting something and liking it?", "topic-11"],
    ["How does a small choice today change a later one?", "topic-05"],
    ["What makes coming back to the same place different from starting over?", "topic-07"],
    ["What is a guide, and what does a guide do?", "topic-08"],
    ["What happens in the body before a thought forms?", "topic-04"],
  ])("maps %s to %s", (text, slug) => {
    expect(STARTER_QUESTIONS.find((question) => question.text === text)?.slug).toBe(slug);
  });

  it.each([undefined, "topic-01"])("opens the examples without changing the draft, sending or saving, topic=%s", (topicSlug) => {
    const sessionWrite = vi.spyOn(Storage.prototype, "setItem");
    render(<QuestionBox {...(topicSlug ? { topicSlug } : {})} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "An edited question" } });
    const examplesLink = screen.getByRole("link", { name: /Just looking around/ });
    expect(examplesLink).toHaveAttribute("href", "/examples");
    fireEvent.click(examplesLink);
    expect(input).toHaveValue("An edited question");
    expect(actions.insert).not.toHaveBeenCalled();
    expect(actions.rpc).not.toHaveBeenCalled();
    expect(actions.sorter).not.toHaveBeenCalled();
    expect(actions.save).not.toHaveBeenCalled();
    expect(actions.navigate).not.toHaveBeenCalled();
    expect(sessionWrite).not.toHaveBeenCalled();
    sessionWrite.mockRestore();
  });

  it("keeps automatic crisis help available when a crisis question cannot be saved", async () => {
    actions.rpc.mockResolvedValue({ data: null, error: null });
    render(<QuestionBox />);
    expect(screen.queryByRole("region", { name: "Crisis help" })).toBeNull();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I want to kill myself" } });
    fireEvent.click(screen.getByRole("button", { name: /^Send$/ }));
    await screen.findByRole("alert");
    expect(screen.getByRole("region", { name: "Crisis help" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Call 988" })).toHaveAttribute("href", "tel:988");
    expect(screen.getByRole("link", { name: "Call 911" })).toHaveAttribute("href", "tel:911");
    expect(actions.sorter).not.toHaveBeenCalled();
  });

  it.each([
    ["topic-01", "topic-01"],
    [undefined, null],
  ])("saves through submit_question with topic slug %s", async (topicSlug, expectedSlug) => {
    actions.rpc.mockResolvedValue({ data: "3f2b7c1e-0000-4000-8000-000000000000", error: null });
    actions.sorter.mockResolvedValue({ ok: true, matches: [1, 4], crisis: false });
    render(<QuestionBox {...(topicSlug ? { topicSlug } : {})} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "A typed question" } });
    fireEvent.click(screen.getByRole("button", { name: /^Send$/ }));
    await waitFor(() => expect(actions.navigate).toHaveBeenCalled());
    expect(actions.rpc).toHaveBeenCalledWith("submit_question", { _topic_slug: expectedSlug, _body: "A typed question" });
    expect(actions.insert).not.toHaveBeenCalled();
  });

  it("shows the save error when the function returns nothing", async () => {
    actions.rpc.mockResolvedValue({ data: null, error: null });
    actions.sorter.mockResolvedValue({ ok: true, matches: [], crisis: false });
    render(<QuestionBox />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "A typed question" } });
    fireEvent.click(screen.getByRole("button", { name: /^Send$/ }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(QUESTION_ERROR));
    expect(actions.navigate).not.toHaveBeenCalled();
    expect(actions.save).not.toHaveBeenCalled();
  });

  it("passes validated saying numbers and fit into saved device results", async () => {
    actions.rpc.mockResolvedValue({ data: "saved", error: null });
    actions.sorter.mockResolvedValue({ ok: true, matches: [5], sayings: { 5: 3, 8: 1 }, fit: "close", crisis: false });
    render(<QuestionBox />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "A habit" } });
    fireEvent.click(screen.getByRole("button", { name: /^Send$/ }));
    await waitFor(() => expect(actions.save).toHaveBeenCalledWith(sessionStorage, { text: "A habit", matches: [5], sayings: { 5: 3 }, fit: "close", crisis: false }));
  });

  it("keeps fallback results loose without saying numbers", async () => {
    actions.rpc.mockResolvedValue({ data: "saved", error: null });
    actions.sorter.mockResolvedValue({ ok: false, matches: [], sayings: { 4: 3 }, fit: "close", crisis: false });
    render(<QuestionBox />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "I feel flooded" } });
    fireEvent.click(screen.getByRole("button", { name: /^Send$/ }));
    await waitFor(() => expect(actions.save).toHaveBeenCalledWith(sessionStorage, { text: "I feel flooded", matches: [4], sayings: {}, fit: "loose", crisis: false }));
  });
});