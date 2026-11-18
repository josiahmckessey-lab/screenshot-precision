import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { QuestionBox } from "@/components/app/QuestionBox";
import { APP_NAME, APP_TAGLINE, QUESTION_TITLE } from "@/lib/brand";
import { WELCOME_HEADING, WELCOME_TEXT } from "@/content/about";

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
      <section className="fade-up flex flex-col gap-6 py-8">
        <h1 className="text-4xl leading-tight">{WELCOME_HEADING}</h1>
        <p className="text-lg leading-relaxed">{WELCOME_TEXT}</p>
        <Link to="/about" className="text-lg underline underline-offset-4">Browse the topics</Link>
      </section>
      <section className="space-y-3 rounded-2xl border bg-card p-5 text-card-foreground">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{QUESTION_TITLE}</h2>
        <QuestionBox />
      </section>
    </AppShell>
  );
}
