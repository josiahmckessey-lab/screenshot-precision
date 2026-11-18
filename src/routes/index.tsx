import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${APP_NAME} — ${APP_TAGLINE}` },
      { name: "description", content: "A read-only library of pictures and plain explanations. For adults 18 and older." },
      { property: "og:title", content: `${APP_NAME} — ${APP_TAGLINE}` },
      { property: "og:description", content: "A read-only library for adults 18 and older." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <AppShell>
      <section className="fade-up flex flex-1 flex-col justify-center gap-6 py-10">
        <h1 className="text-5xl">{APP_NAME}</h1>
        <p className="text-lg text-muted-foreground">{APP_TAGLINE}</p>
      </section>
    </AppShell>
  );
}
