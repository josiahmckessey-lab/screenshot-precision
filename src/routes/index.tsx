import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { QuestionBox } from "@/components/app/QuestionBox";
import { KeptCheckBack } from "@/components/app/KeptCheckBack";
import { ArrowRight } from "lucide-react";
import { APP_DESCRIPTION, APP_PREVIEW_TITLE, HOME_LINK_EXAMPLES, HOME_LINK_TOPICS, QUESTION_TITLE, WALK_TITLE, WELCOME_QUOTE } from "@/lib/brand";
import { WELCOME_HEADING, WELCOME_INVITATION } from "@/content/about";

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

const ROW = "flex min-h-12 w-full items-center justify-between gap-3 py-2 text-lg underline underline-offset-4";

function Home() {
  return (
    <AppShell>
      <section className="fade-up flex flex-col gap-6 py-8">
        <h1 className="text-center text-4xl leading-tight">{WELCOME_HEADING}</h1>
        <p className="text-center font-display text-lg leading-relaxed text-primary">{WELCOME_INVITATION}</p>
        <KeptCheckBack />
        <section className="space-y-3 rounded-2xl border bg-card p-5 text-card-foreground">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{QUESTION_TITLE}</h2>
          <QuestionBox />
        </section>
        <nav className="flex flex-col">
          <Link to="/walk" className={ROW}><span>{WALK_TITLE}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0" /></Link>
          <Link to="/about" hash="topics" className={ROW}><span>{HOME_LINK_TOPICS}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0" /></Link>
          <Link to="/examples" className={ROW}><span>{HOME_LINK_EXAMPLES}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0" /></Link>
        </nav>
        <p className="text-center font-display text-base italic leading-relaxed text-muted-foreground">{WELCOME_QUOTE}</p>
      </section>
    </AppShell>
  );
}
