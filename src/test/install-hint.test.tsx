import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InstallHint, InstallHintProvider, INSTALL_HINT_KEY } from "@/components/app/InstallHint";

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });

function renderHint() {
  return render(<InstallHintProvider><InstallHint /></InstallHintProvider>);
}

describe("Device installation hint", () => {
  it("stores only the dismissal flag and keeps the card dismissed on return", () => {
    const write = vi.spyOn(Storage.prototype, "setItem");
    const view = renderHint();
    fireEvent.click(screen.getByRole("button", { name: "Not now" }));
    expect(write.mock.calls).toEqual([["daybreak-install-hint-v1", "true"]]);
    expect(localStorage.getItem(INSTALL_HINT_KEY)).toBe("true");
    view.unmount();
    renderHint();
    expect(screen.queryByRole("button", { name: "Not now" })).toBeNull();
  });

  it("hides the hint when already running standalone", () => {
    const original = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({ ...original(query), matches: query === "(display-mode: standalone)" }));
    renderHint();
    expect(screen.queryByRole("button", { name: "Not now" })).toBeNull();
  });

  it("retains an early offer until home appears and prompts only on a tap", async () => {
    const view = render(<InstallHintProvider><div /></InstallHintProvider>);
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome: "accepted" }) });
    fireEvent(window, event);
    expect(event.defaultPrevented).toBe(true);
    expect(prompt).not.toHaveBeenCalled();
    view.rerender(<InstallHintProvider><InstallHint /></InstallHintProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Add to home screen" }));
    await waitFor(() => expect(prompt).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Not now" })).toBeNull());
    expect(localStorage.length).toBe(0);
  });

  it("hides the hint after browser installation", () => {
    renderHint();
    fireEvent(window, new Event("appinstalled"));
    expect(screen.queryByRole("button", { name: "Not now" })).toBeNull();
  });
});