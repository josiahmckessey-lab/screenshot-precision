import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { INTRO_COMPLETED_KEY, shouldPlayIntro } from "@/lib/welcome-intro";

vi.mock("@/components/app/AppShell", () => ({ Wordmark: () => null }));
vi.mock("@/components/app/CrisisHelp", () => ({ CrisisButton: () => null }));
import { WelcomeIntro } from "@/components/app/WelcomeIntro";

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe("Welcome sequence", () => {
  it("plays only for a newly accepted device without the completed flag", () => {
    expect(shouldPlayIntro(false, null)).toBe(true);
    expect(shouldPlayIntro(true, null)).toBe(false);
    expect(shouldPlayIntro(false, "true")).toBe(false);
    expect(INTRO_COMPLETED_KEY).toBe("daybreak-intro-v1");
  });

  it("never auto advances and finishes after four Next taps with 400ms exits", () => {
    vi.useFakeTimers();
    const finish = vi.fn();
    render(<WelcomeIntro onFinish={finish} />);
    act(() => vi.advanceTimersByTime(30000));
    expect(finish).not.toHaveBeenCalled();
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole("button", { name: /Next$/ }));
      if (i < 3) expect(finish).not.toHaveBeenCalled();
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

  it("reduced motion never auto advances and Next finishes after four taps", () => {
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
    expect(finish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Next$/ }));
    expect(finish).toHaveBeenCalledTimes(1);
  });
});