import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function PagePending() {
  return (
    <div className="flex min-h-[40dvh] items-center justify-center gap-3" role="status">
      <span className="size-2.5 animate-pulse rounded-full bg-primary" aria-hidden="true" />
      <span className="text-muted-foreground">Opening the page</span>
    </div>
  );
}

export const getRouter = () => {
  // One client per request: a module-level QueryClient leaks cached data between SSR requests.
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Lets Query own freshness; set caching defaults on the QueryClient, not the router.
    defaultPreloadStaleTime: 0,
    defaultPendingMs: 300,
    defaultPendingMinMs: 400,
    defaultPendingComponent: PagePending,
  });

  return router;
};
