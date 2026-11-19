import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STARTER_QUESTIONS, pickStarterQuestions } from "@/content/starter-questions";
import type { ReactNode } from "react";

const actions = vi.hoisted(() => ({ insert: vi.fn(), sorter: vi.fn(), navigate: vi.fn(), save: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => actions.sorter }));
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => actions.navigate,
  useLocation: () => "/",
  Link: ({ params, children }: { params: { slug: string }; children: ReactNode }) =>
    <a href={`/topic/${params.slug}`} onClick={(event) => event.preventDefault()}>{children}</a>,
}));
vi.mock("@/lib/match-topics.functions", () => ({ match_topics: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert: actions.insert }) } }));
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
    const examples = screen.getAllByRole("link");
    expect(examples).toHaveLength(4);
    const example = examples[0];
    if (!example) throw new Error("No example rendered");
    fireEvent.click(example);
    expect(input).toHaveValue("An edited question");
    expect(actions.insert).not.toHaveBeenCalled();
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
});