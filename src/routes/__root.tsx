import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/app/AppShell";
import { AgeScreen } from "@/components/app/AgeScreen";
import { WelcomeIntro } from "@/components/app/WelcomeIntro";
import { InstallHintProvider } from "@/components/app/InstallHint";
import { INTRO_COMPLETED_KEY, shouldPlayIntro } from "@/lib/welcome-intro";
import { APP_DESCRIPTION, AGE_ACCEPTED_KEY, APP_NAME, APP_PREVIEW_TITLE } from "@/lib/brand";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page does not exist or has moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Trying again or going home may help.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    // Never add og:image or twitter:image here: every page without its own would inherit it.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: APP_PREVIEW_TITLE },
      { name: "description", content: APP_DESCRIPTION },
      { property: "og:title", content: APP_PREVIEW_TITLE },
      { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#1B1511" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: APP_NAME },
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useLocation({ select: (l) => l.pathname });
  const router = useRouter();
  // null until the device's local answer is read (after hydration).
  const [adult, setAdult] = useState<boolean | null>(null);
  const [intro, setIntro] = useState(false);
  const [introEligible, setIntroEligible] = useState(false);
  const [homeFade, setHomeFade] = useState(false);
  useEffect(() => {
    const alreadyAdult = localStorage.getItem(AGE_ACCEPTED_KEY) === "true";
    setAdult(alreadyAdult);
    setIntroEligible(shouldPlayIntro(alreadyAdult, localStorage.getItem(INTRO_COMPLETED_KEY)));
  }, []);
  // The safety page is always reachable, even before the age screen.
  const gated = pathname !== "/safety" && adult !== true;

  return (
    <QueryClientProvider client={queryClient}>
      <InstallHintProvider>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      {gated ? (
        <AppShell hideBack hideFooter>{adult === false && <AgeScreen onContinue={() => {
          setAdult(true);
          setIntro(introEligible);
          if (introEligible) void router.navigate({ to: "/" });
        }} />}</AppShell>
      ) : intro && pathname !== "/safety" ? (
        <WelcomeIntro onFinish={() => {
          localStorage.setItem(INTRO_COMPLETED_KEY, "true");
          setIntro(false);
          setHomeFade(true);
          void router.navigate({ to: "/" });
        }} />
      ) : (
        <div className={homeFade ? "intro-home-fade" : "contents"}><Outlet /></div>
      )}
      <Toaster position="top-center" />
      </InstallHintProvider>
    </QueryClientProvider>
  );
}
