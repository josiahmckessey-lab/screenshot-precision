import { createFileRoute, Link } from "@tanstack/react-router";

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
        <Link to="/" className="underline underline-offset-4">← Back to home</Link>
        <h1 className="text-4xl">Privacy</h1>
        {PRIVACY_SECTIONS.map(({ lead, body }) => (
          <p key={lead} className="text-lg leading-relaxed"><strong>{lead}</strong>{" "}{body}</p>
        ))}
        <section className="space-y-4 text-lg leading-relaxed">
          <h2 className="text-2xl">Visitor counting</h2>
          <p>Lovable records clicks on buttons and links for every visitor. Page visits, time on page, page speed, and errors are also recorded for every visitor, without cookies and without identifying anyone.</p>
          <p>The records include pages visited, where visitors came from, country, browser, operating system, device type, time spent, page loading speed, and errors. No cookies are used, nothing is stored on the visitor’s device, IP addresses are not kept, and visitors are not identified. Detailed data is kept for 90 days and daily summaries for a year.</p>
          <p>Lovable collects this data for the library. <a href="https://lovable.dev/privacy" className="underline underline-offset-4">Lovable’s privacy policy</a> explains how it handles it.</p>
        </section>
      </article>
    </AppShell>
  );
}