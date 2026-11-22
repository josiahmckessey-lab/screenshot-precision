import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { APP_NAME, FIND_GUIDE, TOPIC_FOOTER } from "@/lib/brand";
import { BackButton } from "./BackButton";
import { CrisisButton } from "./CrisisHelp";
import { LampMark } from "./LampIllustration";

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LampMark />
      <span className="font-display text-xl tracking-tight">{APP_NAME}</span>
    </span>
  );
}

// Shared safety help stays at the foot of the content, outside the reading lane.
export function AppShell({ children, hideBack = false, hideFooter = false }: { children: ReactNode; hideBack?: boolean; hideFooter?: boolean }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-2 py-3">
        <Link to="/" aria-label={`${APP_NAME} home`}>
          <Wordmark />
        </Link>
      </header>
      {!hideBack && pathname !== "/" && <div className="flex justify-start"><BackButton /></div>}
      <main className="flex flex-1 flex-col">
        <div key={pathname} className="page-enter flex flex-1 flex-col">
          {children}
        </div>
      </main>
      {!hideFooter && (
      <footer className="space-y-3 pt-10 text-base">
        <div className="flex justify-start"><CrisisButton className="min-h-12" /></div>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          <Link to="/about" className="inline-flex min-h-12 items-center underline underline-offset-4">About</Link>
          <Link to="/privacy" className="inline-flex min-h-12 items-center underline underline-offset-4">Privacy</Link>
          <Link to="/guide" className="inline-flex min-h-12 items-center underline underline-offset-4">{FIND_GUIDE}</Link>
        </div>
        <p className="text-sm text-muted-foreground">{TOPIC_FOOTER}</p>
      </footer>
      )}
    </div>
  );
}
