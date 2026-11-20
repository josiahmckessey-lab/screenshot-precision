import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { APP_NAME, RESEARCH_LINK } from "@/lib/brand";
import { CrisisButton } from "./CrisisHelp";

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="/icon-192.png" alt="" width={32} height={32} className="size-8 rounded-lg" />
      <span className="font-display text-xl tracking-tight">{APP_NAME}</span>
    </span>
  );
}

// Every screen uses this shell, so the crisis button is always visible.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-2 py-3">
        <Link to="/" aria-label={`${APP_NAME} home`}>
          <Wordmark />
        </Link>
        <CrisisButton />
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="flex flex-wrap gap-x-6 gap-y-3 pt-8 text-base">
        <Link to="/about" className="underline underline-offset-4">About</Link>
        <Link to="/safety" className="underline underline-offset-4">Safety</Link>
        <Link to="/privacy" className="underline underline-offset-4">Privacy</Link>
        <Link to="/guide" className="underline underline-offset-4">Find a guide</Link>
        <Link to="/about" hash="wellbeing" className="underline underline-offset-4">{RESEARCH_LINK}</Link>
      </footer>
    </div>
  );
}
