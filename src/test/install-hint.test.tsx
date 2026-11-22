import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, type ReactNode } from "react";
import { useState } from "react";
import { InstallHint, InstallHintProvider, INSTALL_HINT_KEY } from "@/components/app/InstallHint";

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });

let swapChild: (node: ReactNode) => void = () => {};

function Root() {
  const [child, setChild] = useState<ReactNode>(<InstallHint />);
  swapChild = setChild;
  return <InstallHintProvider>{child}</InstallHintProvider>;
}

async function renderWithRouter() {
  const rootRoute = createRootRoute({ component: Root });
  const router = createRouter({ routeTree: rootRoute, history: createMemoryHistory({ initialEntries: ["/"] }) });
  await router.load();
  return render(<RouterProvider router={router} />);
}

function renderHint() {
  return renderWithRouter();
}

describe("Device installation hint", () => {
  it("stores only the dismissal flag and keeps the card dismissed on return", async () => {
    const write = vi.spyOn(Storage.prototype, "setItem");
    const view = await renderHint();
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(write.mock.calls).toEqual([["daybreak-install-hint-v1", "true"]]);
    expect(localStorage.getItem(INSTALL_HINT_KEY)).toBe("true");
    view.unmount();
    await renderHint();
    expect(screen.queryByRole("button", { name: "Not now" })).toBeNull();
  });

  it("hides the hint when already running standalone", async () => {
    const original = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({ ...original(query), matches: query === "(display-mode: standalone)" }));
    await renderHint();
    expect(screen.queryByRole("button", { name: "Not now" })).toBeNull();
  });

  it("retains an early offer until home appears and prompts only on a tap", async () => {
    await renderWithRouter();
    act(() => swapChild(<div />));
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome: "accepted" }) });
    fireEvent(window, event);
    expect(event.defaultPrevented).toBe(true);
    expect(prompt).not.toHaveBeenCalled();
    act(() => swapChild(<InstallHint />));
    fireEvent.click(screen.getByRole("button", { name: "Add to home screen" }));
    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Not now" })).toBeNull());
    expect(localStorage.length).toBe(0);
  });

  it("hides the hint after browser installation", async () => {
    await renderHint();
    fireEvent(window, new Event("appinstalled"));
    expect(screen.queryByRole("button", { name: "Not now" })).toBeNull();
  });

  it("links the main button to the steps page when no browser offer exists", async () => {
    await renderHint();
    const link = screen.getByRole("link", { name: "Add to home screen" });
    expect(link.getAttribute("href")).toBe("/install");
    expect(screen.getByText("Keep The Gift on the home screen, one tap away.")).toBeTruthy();
  });
});
