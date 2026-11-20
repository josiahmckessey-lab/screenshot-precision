import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { CrisisPanel } from "@/components/app/CrisisHelp";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: `Safety — ${APP_NAME}` },
      { name: "description", content: APP_DESCRIPTION },
      { property: "og:title", content: `Safety — ${APP_NAME}` },
      { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <div className="space-y-6 py-8">
        <h1 className="text-4xl">Safety</h1>
        <CrisisPanel />
        <p className="text-lg">
          This library is not crisis care. Outside the US, people can call the local emergency
          number. When it is safe, moving away from immediate danger and reaching out to a trusted
          person can help.
        </p>
      </div>
    </AppShell>
  ),
});
