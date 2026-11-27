import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { QuestionBox } from "@/components/app/QuestionBox";
import { KeptCheckBack } from "@/components/app/KeptCheckBack";
import { LampIllustration } from "@/components/app/LampIllustration";
import { APP_DESCRIPTION, APP_PREVIEW_TITLE, QUESTION_TITLE, WELCOME_QUOTE } from "@/lib/brand";
import { WELCOME_HEADING, WELCOME_INVITATION, WELCOME_TEXT, WELCOME_TOPICS_LABEL } from "@/content/about";

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
        <div className="mx-auto w-full max-w-[240px]"><LampIllustration /></div>
        <h1 className="text-center text-4xl leading-tight">{WELCOME_HEADING}</h1>
        <p className="text-center font-display text-lg leading-relaxed text-primary">{WELCOME_INVITATION}</p>
        <KeptCheckBack />
        <section className="space-y-3 rounded-2xl border bg-card p-5 text-card-foreground">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{QUESTION_TITLE}</h2>
          <QuestionBox />
        </section>
        <p className="my-6 text-center font-display text-2xl italic leading-relaxed text-muted-foreground">{WELCOME_QUOTE}</p>
        <p className="text-lg leading-relaxed">
          {WELCOME_TEXT.slice(0, -(WELCOME_TOPICS_LABEL.length + 1))}
          <Link to="/about" hash="topics" className="underline underline-offset-4">{WELCOME_TOPICS_LABEL}</Link>.
        </p>
      </section>
    </AppShell>
  );
}
