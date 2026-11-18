import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { ABOUT_TEXT, APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${APP_NAME}` },
      { name: "description", content: "What this library is, and what it is not." },
      { property: "og:title", content: `About — ${APP_NAME}` },
      { property: "og:description", content: "Pictures and plain explanations drawn from one model of change." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <div className="space-y-6 py-8">
        <h1 className="text-4xl">About</h1>
        <p className="text-lg leading-relaxed">{ABOUT_TEXT}</p>
      </div>
    </AppShell>
  ),
});
