import { cleanup, render, screen } from "@testing-library/react";
import { createMemoryHistory, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { WELCOME_TEXT, WELCOME_TEXT_START } from "@/content/about";
import { WELCOME_QUOTE } from "@/lib/brand";

vi.mock("@/components/app/QuestionBox", () => ({ QuestionBox: () => <div data-testid="question-box" /> }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  from: () => ({ select: () => ({ eq: () => ({ in: async () => ({ data: [], error: null }) }) }) }),
} }));
afterEach(cleanup);

async function open(path: string) {
  routeTree.update({ component: Outlet });
  const queryClient = new QueryClient();
  const router = createRouter({ routeTree, context: { queryClient }, history: createMemoryHistory({ initialEntries: [path] }) });
  await router.load();
  render(<QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider>);
}
const flat = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, " ");

describe("Home and About welcome paragraph", () => {
  it("keeps the long paragraph off the home screen and shows three quiet links", async () => {
    await open("/");
    const main = (await screen.findByTestId("question-box")).closest("main") ?? document.body;
    expect(flat(main.textContent)).not.toContain(WELCOME_TEXT_START.trim());
    const hrefs = ["Walk the whole path", "Browse the topics", "Try a few of these"].map((name) => {
      const link = screen.getByRole("link", { name });
      expect(link.className).toContain("min-h-12");
      return link.getAttribute("href");
    });
    expect(hrefs).toEqual(["/walk", "/about#topics", "/examples"]);
    const box = screen.getByTestId("question-box");
    const walk = screen.getByRole("link", { name: "Walk the whole path" });
    const quote = screen.getByText(WELCOME_QUOTE);
    expect(box.compareDocumentPosition(walk) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(walk.compareDocumentPosition(quote) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("shows only the app name as the heading, the short invitation and no lamp drawing", async () => {
    await open("/");
    const heading = await screen.findByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("The Gift");
    const main = heading.closest("main") ?? document.body;
    expect(flat(main.textContent)).not.toContain("Welcome to");
    expect(flat(main.textContent)).not.toContain("Come in.");
    expect(heading.nextElementSibling?.textContent).toBe("Nothing here is graded.");
    expect(main.querySelector('svg[role="img"]')).toBeNull();
  });

  it("opens About with the long paragraph and its two links", async () => {
    await open("/about");
    const heading = await screen.findByRole("heading", { level: 1, name: "About" });
    const paragraph = heading.nextElementSibling;
    expect(flat(paragraph?.textContent)).toBe(flat(WELCOME_TEXT));
    const links = Array.from(paragraph?.querySelectorAll("a") ?? []);
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["walk the whole path", "/walk"],
      ["browse the topics", "/about#topics"],
    ]);
  });
});
