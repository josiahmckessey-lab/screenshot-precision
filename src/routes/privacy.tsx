import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { PRIVACY_SECTIONS } from "@/content/privacy";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy — ${APP_NAME}` },
      { name: "description", content: APP_DESCRIPTION },
      { property: "og:title", content: `Privacy — ${APP_NAME}` },
      { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <AppShell>
      <article className="space-y-6 py-8">
        <h1 className="text-4xl">Privacy</h1>
        {PRIVACY_SECTIONS.map(({ lead, body }) => (
          <p key={lead} className="text-lg leading-relaxed"><strong>{lead}</strong>{" "}{body}</p>
        ))}
      </article>
    </AppShell>
  );
}