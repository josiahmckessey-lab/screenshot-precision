import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { AGE_LABEL, AGE_STOP, QUESTION_CRISIS_TEXT } from "@/lib/brand";

const router = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
  useLocation: (options?: { select: (l: { pathname: string }) => unknown }) => options ? options.select({ pathname: router.pathname }) : { pathname: router.pathname },
}));
vi.mock("@/components/app/BackButton", () => ({ BackButton: () => null }));

import { AppShell } from "@/components/app/AppShell";
import { AgeScreen } from "@/components/app/AgeScreen";

afterEach(() => { cleanup(); router.pathname = "/"; localStorage.clear(); });

describe("Opening screens stay calm", () => {
  it("age screen has no footer and no Crisis help button", () => {
    render(<AppShell hideBack hideFooter><AgeScreen onContinue={() => {}} /></AppShell>);
    expect(screen.queryByRole("contentinfo")).toBeNull();
    expect(screen.queryByRole("button", { name: "Crisis help" })).toBeNull();
    expect(screen.queryByRole("link", { name: "About" })).toBeNull();
  });

  it("crisis panel appears under the stop message only after continuing unchecked", () => {
    const go = vi.fn();
    render(<AgeScreen onContinue={go} />);
    expect(screen.queryByText(QUESTION_CRISIS_TEXT)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    const stop = screen.getByText(AGE_STOP);
    const panel = screen.getByRole("region", { name: "Crisis help" });
    expect(within(panel).getByText(QUESTION_CRISIS_TEXT)).toBeTruthy();
    expect(stop.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(go).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", { name: AGE_LABEL }));
    expect(screen.queryByText(QUESTION_CRISIS_TEXT)).toBeNull();
  });

  it.each(["/", "/topic/topic-10", "/ask", "/topic/topic-10/more/1"])("%s has Crisis help once, in the footer", (path) => {
    router.pathname = path;
    render(<AppShell><p>Page</p></AppShell>);
    expect(screen.getAllByRole("button", { name: "Crisis help" })).toHaveLength(1);
    expect(within(screen.getByRole("contentinfo")).getByRole("button", { name: "Crisis help" })).toBeTruthy();
  });
});
