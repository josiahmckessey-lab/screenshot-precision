import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STARTER_QUESTIONS, pickStarterQuestions } from "@/content/starter-questions";
import { QUESTION_ERROR } from "@/lib/brand";
import type { ReactNode } from "react";

const actions = vi.hoisted(() => ({ insert: vi.fn(), rpc: vi.fn(), sorter: vi.fn(), navigate: vi.fn(), save: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => actions.sorter }));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => actions.navigate,
  useLocation: () => "/",
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
vi.mock("@/components/app/CrisisHelp", () => ({ CrisisPanel: () => null }));

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

  it("selects four unique questions with randomized ordering", () => {
    const first = pickStarterQuestions([], () => 0);
    const second = pickStarterQuestions([], () => 0.99);
    expect(first).toHaveLength(4);
    expect(new Set(first).size).toBe(4);
    expect(first.every((q) => STARTER_QUESTIONS.some((s) => s === q))).toBe(true);
    expect(first).not.toEqual(second);
  });

  it("swaps in four others without repeating the displayed questions", () => {
    const first = pickStarterQuestions();
    const next = pickStarterQuestions(first);
    expect(next).toHaveLength(4);
    expect(next.some((q) => first.includes(q))).toBe(false);
  });

  it.each([undefined, "topic-01"])("opens a topic without changing the draft, sending or saving, topic=%s", (topicSlug) => {
    const sessionWrite = vi.spyOn(Storage.prototype, "setItem");
    render(<QuestionBox {...(topicSlug ? { topicSlug } : {})} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "An edited question" } });
    const examples = screen.getAllByRole("link").filter((link) => link.getAttribute("href")?.startsWith("/topic/"));
    expect(examples).toHaveLength(4);
    const example = examples[0];
    if (!example) throw new Error("No example rendered");
    fireEvent.click(example);
    expect(input).toHaveValue("An edited question");
    expect(actions.insert).not.toHaveBeenCalled();
    expect(actions.rpc).not.toHaveBeenCalled();
    expect(actions.sorter).not.toHaveBeenCalled();
    expect(actions.save).not.toHaveBeenCalled();
    expect(actions.navigate).not.toHaveBeenCalled();
    expect(sessionWrite).not.toHaveBeenCalled();
    sessionWrite.mockRestore();
  });

  it("restores the same examples after leaving and returning", () => {
    const first = render(<QuestionBox />);
    fireEvent.click(screen.getByRole("button", { name: "Show different examples" }));
    const selected = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    first.unmount();
    render(<QuestionBox />);
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(selected);
  });

  it.each([
    ["topic-01", "topic-01"],
    [undefined, null],
  ])("saves through submit_question with topic slug %s", async (topicSlug, expectedSlug) => {
    actions.rpc.mockResolvedValue({ data: "3f2b7c1e-0000-4000-8000-000000000000", error: null });
    actions.sorter.mockResolvedValue({ ok: true, matches: [1, 4], crisis: false });
    render(<QuestionBox {...(topicSlug ? { topicSlug } : {})} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "A typed question" } });
    fireEvent.click(screen.getByRole("button", { name: "Send question" }));
    await waitFor(() => expect(actions.navigate).toHaveBeenCalled());
    expect(actions.rpc).toHaveBeenCalledWith("submit_question", { _topic_slug: expectedSlug, _body: "A typed question" });
    expect(actions.insert).not.toHaveBeenCalled();
  });

  it("shows the save error when the function returns nothing", async () => {
    actions.rpc.mockResolvedValue({ data: null, error: null });
    actions.sorter.mockResolvedValue({ ok: true, matches: [], crisis: false });
    render(<QuestionBox />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "A typed question" } });
    fireEvent.click(screen.getByRole("button", { name: "Send question" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(QUESTION_ERROR));
    expect(actions.navigate).not.toHaveBeenCalled();
    expect(actions.save).not.toHaveBeenCalled();
  });
});