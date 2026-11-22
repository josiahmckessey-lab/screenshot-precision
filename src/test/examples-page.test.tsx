import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { STARTER_QUESTIONS } from "@/content/starter-questions";

vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  from: (table: string) => ({ select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({
    data: table === "library_deeper" ? null : { slug: "topic-02", title: "A topic", picture: "A picture", sentence: "A sentence", scripture: [] }, error: null,
  }) }) }) }) }),
} }));
afterEach(cleanup);

describe("All starter questions", () => {
  it.each(STARTER_QUESTIONS)("opens $slug from the examples page", async (question) => {
    routeTree.update({ component: Outlet });
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() }, history: createMemoryHistory({ initialEntries: ["/examples"] }) });
    await router.load();
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole("link", { name: question.text }));
    await waitFor(() => expect(router.state.location.pathname).toBe(`/topic/${question.slug}`));
    expect(router.state.matches.at(-1)?.routeId).toBe("/topic/$slug");
  });
});