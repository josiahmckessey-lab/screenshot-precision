import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { QuestionBox } from "@/components/app/QuestionBox";
import { APP_DESCRIPTION, APP_PREVIEW_TITLE, QUESTION_TITLE, RESEARCH_LINK, RESEARCH_NOTICE } from "@/lib/brand";
import { WELCOME_HEADING, WELCOME_TEXT } from "@/content/about";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: APP_PREVIEW_TITLE },
      { name: "description", content: APP_DESCRIPTION },
      { property: "og:title", content: APP_PREVIEW_TITLE },
      { property: "og:description", content: APP_DESCRIPTION },
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
        <p className="text-sm leading-relaxed text-muted-foreground">
          {RESEARCH_NOTICE}{" "}
          <Link to="/about" hash="wellbeing" className="underline underline-offset-4">{RESEARCH_LINK}</Link>
        </p>
        <Link to="/about" hash="topics" className="text-lg underline underline-offset-4">Browse the topics</Link>
      </section>
      <section className="space-y-3 rounded-2xl border bg-card p-5 text-card-foreground">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{QUESTION_TITLE}</h2>
        <QuestionBox />
      </section>
    </AppShell>
  );
}
