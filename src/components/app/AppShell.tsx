import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { APP_NAME } from "@/lib/brand";

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <img src="/icon-192.png" alt="" width={32} height={32} className="size-8 rounded-lg" />
      <span className="font-display text-xl tracking-tight">{APP_NAME}</span>
    </span>
  );
}

export function AppShell({
  children,
  nav,
}: {
  children: ReactNode;
  nav?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between py-3">
        <Link to="/" aria-label={`${APP_NAME} home`}>
          <Wordmark />
        </Link>
        {nav}
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
