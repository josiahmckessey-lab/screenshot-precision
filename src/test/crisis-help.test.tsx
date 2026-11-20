import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { BACK_TO_LIBRARY, CRISIS_TEXT } from "@/lib/brand";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
}));

import { CrisisButton } from "@/components/app/CrisisHelp";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function openPanel() {
  fireEvent.click(screen.getByRole("button", { name: "Crisis help" }));
}

function bodyText() {
  return document.body.textContent ?? "";
}

describe("Crisis help panel", () => {
  it("keeps the crisis numbers above the back control, in order", () => {
    render(<CrisisButton />);
    openPanel();
    const text = bodyText();
    expect(text).toContain(CRISIS_TEXT);
    const positions = ["Call 988", "Text 988", "Call 911", "Safety page", BACK_TO_LIBRARY].map((label) => text.indexOf(label));
    positions.forEach((position, index) => {
      expect(position, `missing label at index ${index}`).toBeGreaterThan(-1);
    });
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("closes the panel from the back control and drops the extra history entry", () => {
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    render(<CrisisButton />);
    openPanel();
    expect(screen.queryByText(CRISIS_TEXT)).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: BACK_TO_LIBRARY }));
    return waitFor(() => expect(screen.queryByText(CRISIS_TEXT)).toBeNull()).then(() => {
      expect(back).toHaveBeenCalledTimes(1);
    });
  });

  it("adds a history entry on open so browser back returns to the same screen", () => {
    const push = vi.spyOn(window.history, "pushState").mockImplementation(() => {});
    render(<CrisisButton />);
    openPanel();
    expect(push).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(CRISIS_TEXT)).not.toBeNull();
  });

  it("closes when the browser back button is used", async () => {
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    render(<CrisisButton />);
    openPanel();
    expect(screen.queryByText(CRISIS_TEXT)).not.toBeNull();
    fireEvent(window, new Event("popstate"));
    await waitFor(() => expect(screen.queryByText(CRISIS_TEXT)).toBeNull());
    expect(back).not.toHaveBeenCalled();
  });
});
