import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { QuestionBox } from "@/components/app/QuestionBox";
import { LampIllustration } from "@/components/app/LampIllustration";
import { APP_DESCRIPTION, APP_PREVIEW_TITLE, FIND_GUIDE, HOME_GUIDE_TEXT, QUESTION_TITLE, RESEARCH_LINK, RESEARCH_NOTICE } from "@/lib/brand";
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
        <LampIllustration />
        <h1 className="text-4xl leading-tight">{WELCOME_HEADING}</h1>
        <p className="text-center font-display text-lg leading-relaxed text-primary">{WELCOME_INVITATION}</p>
        <p className="text-lg leading-relaxed">
          {WELCOME_TEXT.slice(0, -(WELCOME_TOPICS_LABEL.length + 1))}
          <Link to="/about" hash="topics" className="underline underline-offset-4">{WELCOME_TOPICS_LABEL}</Link>.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {RESEARCH_NOTICE}{" "}
          <Link to="/about" hash="wellbeing" className="underline underline-offset-4">{RESEARCH_LINK}</Link>
        </p>
        <Link to="/about" hash="topics" className="text-lg underline underline-offset-4">Browse the topics</Link>
      </section>
      <section className="mb-6 flex items-start gap-4 rounded-lg bg-card p-5 text-card-foreground">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl text-primary-foreground">J</span>
        <div className="space-y-3">
          <p className="text-base leading-relaxed">{HOME_GUIDE_TEXT}</p>
          <Link to="/guide" className="text-primary underline underline-offset-4">{FIND_GUIDE}</Link>
        </div>
      </section>
      <section className="space-y-3 rounded-2xl border bg-card p-5 text-card-foreground">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{QUESTION_TITLE}</h2>
        <QuestionBox />
      </section>
    </AppShell>
  );
}
