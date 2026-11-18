import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { APP_NAME, GUIDE_TEXT } from "@/lib/brand";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: `Find a guide — ${APP_NAME}` },
      { name: "description", content: GUIDE_TEXT },
      { property: "og:title", content: `Find a guide — ${APP_NAME}` },
      { property: "og:description", content: GUIDE_TEXT },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <div className="space-y-6 py-8">
        <h1 className="text-4xl">Find a guide</h1>
        <p className="text-lg">{GUIDE_TEXT}</p>
      </div>
    </AppShell>
  ),
});
