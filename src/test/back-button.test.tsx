import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";
import { AppShell } from "@/components/app/AppShell";

afterEach(cleanup);

async function open(entries: string[]) {
  const root = createRootRoute({ component: Outlet });
  const page = () => <AppShell><p>Content</p></AppShell>;
  const routes = ["/", "/ask", "/topic/$slug", "/topic/$slug/more/$position"].map((path) => createRoute({
    getParentRoute: () => root, path, component: page,
    validateSearch: (search: Record<string, unknown>) => search,
  }));
  const router = createRouter({ routeTree: root.addChildren(routes), history: createMemoryHistory({ initialEntries: entries }), scrollRestoration: true });
  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}

describe("Shared Back navigation", () => {
  it("uses earlier in-app history and retains search state", async () => {
    const router = await open(["/topic/topic-09?read=2&chooser=true", "/ask"]);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/topic/topic-09"));
    expect(router.state.location.search).toEqual({ read: 2, chooser: true });
  });
  it.each(["/ask", "/topic/topic-09"])("falls back to home on a direct %s arrival", async (path) => {
    const router = await open([path]);
    fireEvent.click(screen.getByRole("link", { name: "Back" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
    expect(router.history.location.state.__TSR_index).toBe(0);
    expect(screen.queryByRole("link", { name: "Back" })).toBeNull();
  });
  it("falls back to the topic with sayings open for a direct saying arrival", async () => {
    const router = await open(["/topic/topic-09/more/2"]);
    fireEvent.click(screen.getByRole("link", { name: "Back" }));
    await waitFor(() => expect(router.state.location.pathname).toBe("/topic/topic-09"));
    expect(router.state.location.search).toEqual({ read: 1, chooser: true });
  });
});