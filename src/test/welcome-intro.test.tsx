import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { INTRO_COMPLETED_KEY, shouldPlayIntro } from "@/lib/welcome-intro";
import { INTRO_LINES } from "@/content/about";
import { WELCOME_QUOTE } from "@/lib/brand";

vi.mock("@/components/app/AppShell", () => ({ Wordmark: () => null }));
import { WelcomeIntro } from "@/components/app/WelcomeIntro";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe("Welcome sequence", () => {
  it("plays only for a newly accepted device without the completed flag", () => {
    expect(shouldPlayIntro(false, null)).toBe(true);
    expect(shouldPlayIntro(true, null)).toBe(false);
    expect(shouldPlayIntro(false, "true")).toBe(false);
    expect(INTRO_COMPLETED_KEY).toBe("daybreak-intro-v1");
  });

  it("keeps five lines with the quoted line third", () => {
    expect(INTRO_LINES).toEqual([
      "Come in.",
      "Welcome to The Gift",
      WELCOME_QUOTE,
      "A person is one whole creature, not a pile of separate parts.",
      "Change happens in the whole of a person, one small choice at a time.",
    ]);
    expect(INTRO_LINES).toHaveLength(5);
  });

  it("never auto advances and finishes after five Next taps with 400ms exits", () => {
    vi.useFakeTimers();
    const finish = vi.fn();
    render(<WelcomeIntro onFinish={finish} />);
    act(() => vi.advanceTimersByTime(30000));
    expect(finish).not.toHaveBeenCalled();
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole("button", { name: /Next$/ }));
      if (i < 4) expect(finish).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(400));
    }
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it("Skip finishes immediately", () => {
    const finish = vi.fn();
    render(<WelcomeIntro onFinish={finish} />);
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(finish).toHaveBeenCalledTimes(1);
  });

  it("reduced motion never auto advances and Next finishes after five taps", () => {
    vi.useFakeTimers();
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      matches: true, media: query, onchange: null,
      addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(),
      removeEventListener: vi.fn(), dispatchEvent: () => false,
    }));
    const finish = vi.fn();
    render(<WelcomeIntro onFinish={finish} />);
    act(() => vi.advanceTimersByTime(30000));
    expect(finish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Next$/ }));
    fireEvent.click(screen.getByRole("button", { name: /Next$/ }));
    fireEvent.click(screen.getByRole("button", { name: /Next$/ }));
    fireEvent.click(screen.getByRole("button", { name: /Next$/ }));
    expect(finish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Next$/ }));
    expect(finish).toHaveBeenCalledTimes(1);
  });
  it("shows no Crisis help button", () => {
    render(<WelcomeIntro onFinish={() => {}} />);
    expect(screen.queryByRole("button", { name: /crisis help/i })).toBeNull();
  });
});
