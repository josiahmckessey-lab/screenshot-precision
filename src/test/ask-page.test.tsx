import { cleanup, render, waitFor } from "@testing-library/react";
import { createMemoryHistory, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";

const mocks = vi.hoisted(() => ({ box: vi.fn(), from: vi.fn(), eq: vi.fn(), one: vi.fn() }));
vi.mock("@/components/app/QuestionBox", () => ({ QuestionBox: (props: { topicSlug?: string }) => { mocks.box(props); return null; } }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: mocks.from } }));
afterEach(cleanup);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.from.mockReturnValue({ select: () => ({ eq: mocks.eq }) });
  mocks.eq.mockReturnValue({ eq: mocks.eq, maybeSingle: mocks.one });
  mocks.one.mockResolvedValue({ data: { slug: "topic-09" }, error: null });
});
async function open(path: string) {
  routeTree.update({ component: Outlet });
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() }, history: createMemoryHistory({ initialEntries: [path] }) });
  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}
describe("Dedicated question page", () => {
  it("opens a general question box without a topic", async () => {
    const router = await open("/ask");
    await waitFor(() => expect(mocks.box).toHaveBeenCalledWith({}));
    expect(router.state.matches.at(-1)?.routeId).toBe("/ask");
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it("scopes the question box to an active topic", async () => {
    await open("/ask?topic=topic-09");
    await waitFor(() => expect(mocks.box).toHaveBeenCalledWith({ topicSlug: "topic-09" }));
    expect(mocks.eq).toHaveBeenCalledWith("slug", "topic-09");
    expect(mocks.eq).toHaveBeenCalledWith("status", "active");
  });
  it("uses a general question box for an unknown topic", async () => {
    mocks.one.mockResolvedValue({ data: null, error: null });
    await open("/ask?topic=topic-99");
    await waitFor(() => expect(mocks.box).toHaveBeenCalledWith({}));
  });
  it("rejects malformed topic scope without querying", async () => {
    await open("/ask?topic=outside");
    await waitFor(() => expect(mocks.box).toHaveBeenCalledWith({}));
    expect(mocks.from).not.toHaveBeenCalled();
  });
});