import { createFileRoute, Link, useRouter, type ErrorComponentProps, type SearchSchemaInput } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { Card, Md } from "@/components/app/TopicCards";
import { Button } from "@/components/ui/button";
import { loadWalk, type WalkItem } from "@/lib/walk-load";
import { clearWalkStep, readWalkStep, saveWalkStep, validateWalkSearch } from "@/lib/walk";
import {
  APP_DESCRIPTION, APP_NAME, DEEPER_BROWSE, FIND_GUIDE, TOPIC_PICTURE_LABEL, TOPIC_SENTENCE_LABEL,
  WALK_AGAIN, WALK_BEGIN, WALK_CONTINUE, WALK_DONE_TEXT, WALK_DONE_TITLE, WALK_INTRO, WALK_LOAD_ERROR,
  WALK_NEXT, WALK_QUESTION_LABEL, WALK_READ_TOPIC, WALK_RESTART, WALK_RETRY, WALK_TITLE,
} from "@/lib/brand";

const PAGE_TITLE = `${WALK_TITLE}, ${APP_NAME}`;

export const Route = createFileRoute("/walk")({
  validateSearch: (search: Record<string, unknown> & SearchSchemaInput) => validateWalkSearch(search),
  loader: () => loadWalk(),
  head: () => ({ meta: [
    { title: PAGE_TITLE },
    { name: "description", content: APP_DESCRIPTION },
    { property: "og:title", content: PAGE_TITLE },
    { property: "og:description", content: APP_DESCRIPTION },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: WalkPage,
  errorComponent: WalkError,
  notFoundComponent: () => <AppShell><p className="py-8 text-lg">{WALK_LOAD_ERROR}</p></AppShell>,
});

function WalkError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <AppShell>
      <div className="space-y-4 py-8" role="alert">
        <p className="text-lg">{WALK_LOAD_ERROR}</p>
        <Button onClick={() => { void router.invalidate(); reset(); }}>{WALK_RETRY}</Button>
      </div>
    </AppShell>
  );
}

function WalkPage() {
  const items = Route.useLoaderData();
  const { step, done } = Route.useSearch();
  const item = step ? items[step - 1] : undefined;
  if (done) return <AppShell><WalkDone /></AppShell>;
  if (step && item) return <AppShell><WalkStep key={step} item={item} step={step} last={step >= items.length} /></AppShell>;
  return <AppShell><WalkEntry count={items.length} /></AppShell>;
}

function WalkEntry({ count }: { count: number }) {
  const [saved, setSaved] = useState<number | null>(null);
  useEffect(() => {
    const step = readWalkStep();
    setSaved(step !== null && step >= 2 && step <= count ? step : null);
  }, [count]);
  return (
    <section className="space-y-6 py-8">
      <h1 className="text-4xl leading-tight">{WALK_TITLE}</h1>
      <p className="text-lg leading-relaxed">{WALK_INTRO}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {saved === null
          ? <Button asChild size="lg" variant="calm"><Link to="/walk" search={{ step: 1 }}>{WALK_BEGIN}</Link></Button>
          : <>
            <Button asChild size="lg" variant="calm"><Link to="/walk" search={{ step: saved }}>{WALK_CONTINUE}</Link></Button>
            <Button asChild size="lg" variant="quiet" className="min-h-12 rounded-full"><Link to="/walk" search={{ step: 1 }}>{WALK_RESTART}</Link></Button>
          </>}
      </div>
    </section>
  );
}

function WalkStep({ item, step, last }: { item: WalkItem; step: number; last: boolean }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const reply = chosen === null ? undefined : item.options[chosen]?.reply;
  const answered = chosen !== null || item.options.length === 0;
  return (
    <article className="space-y-6 py-4">
      <h1 className="text-4xl leading-tight sm:text-5xl">{item.title}</h1>
      <Card label={TOPIC_PICTURE_LABEL}><Md text={item.picture} /></Card>
      <Card label={TOPIC_SENTENCE_LABEL}><p className="text-2xl leading-snug">{item.sentence}</p></Card>
      <Card label={WALK_QUESTION_LABEL}>
        <p className="text-xl leading-snug">{item.question}</p>
        <div className="flex flex-col gap-3">
          {item.options.map((option, index) => (
            <Button key={index} variant="outline" aria-pressed={chosen === index}
              className="h-auto min-h-12 w-full rounded-full whitespace-normal px-4 py-3 text-base aria-pressed:border-primary aria-pressed:bg-accent"
              onClick={() => setChosen(index)}>{option.label}</Button>
          ))}
        </div>
        <div role="status">
          {reply && <p className="rounded-2xl border bg-muted p-4 text-lg leading-relaxed">{reply}</p>}
        </div>
      </Card>
      {answered && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="calm">
            {last
              ? <Link to="/walk" search={{ done: true }}>{WALK_NEXT}</Link>
              : <Link to="/walk" search={{ step: step + 1 }} onClick={() => { saveWalkStep(step + 1); }}>{WALK_NEXT}</Link>}
          </Button>
          <Button asChild size="lg" variant="quiet" className="min-h-12 rounded-full">
            <Link to="/topic/$slug" params={{ slug: item.slug }}>{WALK_READ_TOPIC}</Link>
          </Button>
        </div>
      )}
    </article>
  );
}

function WalkDone() {
  useEffect(() => { clearWalkStep(); }, []);
  return (
    <section className="space-y-6 py-8">
      <h1 className="text-4xl leading-tight">{WALK_DONE_TITLE}</h1>
      <p className="text-lg leading-relaxed">{WALK_DONE_TEXT}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild size="lg" variant="calm"><Link to="/guide">{FIND_GUIDE}</Link></Button>
        <Button asChild size="lg" variant="quiet" className="min-h-12 rounded-full"><Link to="/about" hash="topics">{DEEPER_BROWSE}</Link></Button>
        <Button asChild size="lg" variant="quiet" className="min-h-12 rounded-full"><Link to="/walk" search={{ step: 1 }}>{WALK_AGAIN}</Link></Button>
      </div>
    </section>
  );
}
