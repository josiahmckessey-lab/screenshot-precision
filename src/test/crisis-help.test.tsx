import { fireEvent, render, screen, cleanup, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { BACK_TO_LIBRARY, CRISIS_TEXT } from "@/lib/brand";

const router = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
  useLocation: (options?: { select: (location: { pathname: string }) => unknown }) => options ? options.select({ pathname: router.pathname }) : { pathname: router.pathname },
}));
vi.mock("@/components/app/BackButton", () => ({ BackButton: () => null }));

import { CrisisButton, CrisisPanel } from "@/components/app/CrisisHelp";
import { AppShell } from "@/components/app/AppShell";

afterEach(() => {
  cleanup();
  router.pathname = "/";
  vi.restoreAllMocks();
});

function openPanel() {
  fireEvent.click(screen.getByRole("button", { name: "Crisis help" }));
}

function bodyText() {
  return document.body.textContent ?? "";
}

describe("Crisis help panel", () => {
  it.each(["/", "/topic/topic-10", "/ask", "/topic/topic-10/more/1"])("opens the shared footer help without leaving %s", (path) => {
    router.pathname = path;
    vi.spyOn(window.history, "pushState").mockImplementation(() => {});
    render(<AppShell><p>Page content</p></AppShell>);
    fireEvent.click(within(screen.getByRole("contentinfo")).getByRole("button", { name: "Crisis help" }));
    expect(within(screen.getByRole("dialog")).getByRole("link", { name: "Call 988" })).toHaveAttribute("href", "tel:988");
    expect(router.pathname).toBe(path);
  });
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

  it("closes the panel from the back control and drops the extra history entry", async () => {
    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    render(<CrisisButton />);
    openPanel();
    expect(screen.queryByText(CRISIS_TEXT)).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: BACK_TO_LIBRARY }));
    await waitFor(() => expect(screen.queryByText(CRISIS_TEXT)).toBeNull());
    expect(back).toHaveBeenCalledTimes(1);
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

describe("Safety page link inside the crisis box", () => {
  it("shows the link on every other screen", () => {
    render(<CrisisPanel />);
    expect(screen.getByRole("link", { name: "Safety page" })).toHaveAttribute("href", "/safety");
  });

  it("hides the link while the visitor is already on the Safety page", () => {
    router.pathname = "/safety";
    render(<CrisisPanel />);
    expect(screen.queryByRole("link", { name: "Safety page" })).toBeNull();
    // the crisis sentence and the three numbers stay untouched
    expect(screen.getByText(CRISIS_TEXT)).toBeDefined();
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual(["tel:988", "sms:988", "tel:911"]);
  });
});
