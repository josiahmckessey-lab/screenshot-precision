import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STARTER_QUESTIONS, pickStarterQuestions } from "@/content/starter-questions";

const actions = vi.hoisted(() => ({ insert: vi.fn(), sorter: vi.fn(), navigate: vi.fn(), save: vi.fn() }));
vi.mock("@tanstack/react-start", () => ({ useServerFn: () => actions.sorter }));
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => actions.navigate }));
vi.mock("@/lib/match-topics.functions", () => ({ match_topics: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ insert: actions.insert }) } }));
vi.mock("@/lib/ideas-session", () => ({ saveIdeas: actions.save }));
vi.mock("@/components/app/CrisisHelp", () => ({ CrisisPanel: () => null }));

import { QuestionBox } from "@/components/app/QuestionBox";

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("Starter question behavior", () => {
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

  it.each([undefined, "topic-01"])("selects an editable draft without sending or saving, topic=%s", (topicSlug) => {
    const sessionWrite = vi.spyOn(Storage.prototype, "setItem");
    render(<QuestionBox {...(topicSlug ? { topicSlug } : {})} />);
    const example = screen.getAllByRole("button").find((button) => STARTER_QUESTIONS.some((q) => q === button.textContent));
    if (!example) throw new Error("No example rendered");
    fireEvent.click(example);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue(example.textContent);
    fireEvent.change(input, { target: { value: "An edited question" } });
    expect(input).toHaveValue("An edited question");
    expect(actions.insert).not.toHaveBeenCalled();
    expect(actions.sorter).not.toHaveBeenCalled();
    expect(actions.save).not.toHaveBeenCalled();
    expect(actions.navigate).not.toHaveBeenCalled();
    expect(sessionWrite).not.toHaveBeenCalled();
    sessionWrite.mockRestore();
  });
});