import { createFileRoute, Link, notFound, useRouter, type ErrorComponentProps, type SearchSchemaInput } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { Streamdown } from "streamdown";

import { AppShell } from "@/components/app/AppShell";
import { DeeperLayer } from "@/components/app/DeeperLayer";
import { TopicLanding } from "@/components/app/TopicLanding";
import { loadDeeper } from "@/lib/deeper";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { readingLane, validateTopicSearch } from "@/lib/topic-screen";
import { APP_DESCRIPTION,
  APP_NAME, DEPTH_TITLES, KEEP_READING_LABEL, ASK_DIFFERENT_LABEL, SCRIPTURE_LABEL,
  SCRIPTURE_MORE_LABEL, SCRIPTURE_WHY_LABEL,
  TOPIC_PICTURE_LABEL, TOPIC_SENTENCE_LABEL, TRY_LABEL, LANDING_LABEL,
} from "@/lib/brand";

type ScriptureItem = { heading: string; verse: string; reference: string; explanation?: string };

async function loadTopic(slug: string) {
  const { data, error } = await supabase
    .from("library_pages")
    .select("slug,title,picture,sentence,level1,level2,level3,try_text,scripture")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error("The topic could not be loaded.");
  if (!data) throw notFound();
  const scripture: ScriptureItem[] = Array.isArray(data.scripture)
    ? (data.scripture as unknown[]).flatMap((s) => {
        const o = s as Partial<ScriptureItem> | null;
        return o && typeof o.verse === "string"
          ? [{
              heading: String(o.heading ?? ""), verse: o.verse, reference: String(o.reference ?? ""),
              ...(typeof o.explanation === "string" ? { explanation: o.explanation } : {}),
            }]
          : [];
      })
    : [];
  const deeper = await loadDeeper(slug);
  return { ...data, scripture, deeper };
}

export const Route = createFileRoute("/topic/$slug")({
  validateSearch: (search: Record<string, unknown> & SearchSchemaInput) => validateTopicSearch(search),
  loader: ({ params }) => loadTopic(params.slug),
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — ${APP_NAME}` : `Topic — ${APP_NAME}`;
    return {
      meta: [
        { title }, { name: "description", content: APP_DESCRIPTION },
        { property: "og:title", content: title }, { property: "og:description", content: APP_DESCRIPTION },
        { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: TopicPage,
  errorComponent: TopicError,
  notFoundComponent: () => (
    <AppShell>
      <div className="space-y-4 py-8">
        <h1 className="text-3xl">This topic is not in the library.</h1>
      </div>
    </AppShell>
  ),
});

function TopicError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <AppShell>
      <div className="space-y-4 py-8" role="alert">
        <p className="text-lg">{error instanceof Error ? error.message : "Something went wrong."}</p>
        <Button onClick={() => { router.invalidate(); reset(); }}>Try again</Button>
      </div>
    </AppShell>
  );
}

function Card({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border bg-card p-5 text-card-foreground">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{label}</h2>
      {children}
    </section>
  );
}

function Md({ text }: { text: string }) {
  return <Streamdown className="prose-text space-y-4 text-lg leading-relaxed [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">{text}</Streamdown>;
}

function VerseBlock({ s }: { s: ScriptureItem }) {
  return (
    <div className="space-y-2">
      {s.heading && <p className="font-bold">{s.heading}</p>}
      <blockquote className="whitespace-pre-line border-l-4 pl-4 text-lg italic">{s.verse}</blockquote>
      <p className="text-muted-foreground">{s.reference}</p>
    </div>
  );
}

function ScriptureSection({ items, open, moreOpen, onOpen, onMore }: { items: ScriptureItem[]; open: boolean; moreOpen: boolean; onOpen: (open: boolean) => void; onMore: (open: boolean) => void }) {
  if (items.length === 0) return null;
  const first = items[0];
  if (!first) return null;

  const hasExplanation = typeof first.explanation === "string";
  const rest = items.slice(1);

  return (
    <Collapsible open={open} onOpenChange={onOpen} className="rounded-2xl border p-5">
      <CollapsibleTrigger className="min-h-12 w-full text-left text-lg font-semibold underline-offset-4 hover:underline">
        {SCRIPTURE_LABEL}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-6 pt-4">
        {hasExplanation ? (
          <>
            <VerseBlock s={first} />
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{SCRIPTURE_WHY_LABEL}</p>
              <p className="text-lg leading-relaxed">{first.explanation}</p>
            </div>
            {rest.length > 0 && (
              <Collapsible open={moreOpen} onOpenChange={onMore}>
                <CollapsibleTrigger className="min-h-12 text-base underline underline-offset-4">
                  {SCRIPTURE_MORE_LABEL}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-6 pt-2">
                  {rest.map((s, i) => <VerseBlock key={i} s={s} />)}
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        ) : (
          items.map((s, i) => <VerseBlock key={i} s={s} />)
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

function TopicPage() {
  const t = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { depth, showFit, canRead } = readingLane(search.read, Boolean(t.deeper), search.fits, search.chooser);
  const levels = [t.level1, t.level2, t.level3];
  function update(patch: Partial<typeof search>) {
    void navigate({ search: (previous) => ({ ...previous, ...patch }), replace: true, resetScroll: false });
  }
  return (
    <AppShell>
      <article className="space-y-6 py-4">
        <h1 className="text-4xl leading-tight sm:text-5xl">{t.title}</h1>
        <Card label={TOPIC_PICTURE_LABEL}><Md text={t.picture} /></Card>
        <Card label={TOPIC_SENTENCE_LABEL}><p className="text-2xl leading-snug">{t.sentence}</p></Card>
        <section className="space-y-6">
          {levels.slice(0, depth).map((text, i) => <Card key={i} label={DEPTH_TITLES[i] ?? ""}><Md text={text ?? ""} /></Card>)}
          {showFit && t.deeper && <DeeperLayer slug={t.slug} data={t.deeper} chooserOpen={search.chooser} fits={search.fits} allOpen={search.all} wordsOpen={search.words}
            onFit={() => update({ fits: true, chooser: false })}
            onChoose={() => update({ chooser: true, read: Math.max(1, depth) })}
            onAll={() => update({ all: true })} onWords={(words) => update({ words })} />}
          {canRead && <Button size="lg" variant="calm" className="min-h-12" onClick={() => update({ read: depth + 1 })}>{KEEP_READING_LABEL}</Button>}
        </section>
        <Card label={TRY_LABEL}><Md text={t.try_text} /></Card>
        <Card label={LANDING_LABEL}><TopicLanding key={t.slug} slug={t.slug} title={t.title} hasDeeper={Boolean(t.deeper)}
          onChoose={() => update({ chooser: true, read: Math.max(1, depth) })} /></Card>
        <ScriptureSection items={t.scripture} open={search.scripture} moreOpen={search.verses} onOpen={(scripture) => update({ scripture })} onMore={(verses) => update({ verses })} />
        <Link to="/ask" search={{ topic: t.slug }} className="inline-flex min-h-12 items-center text-muted-foreground underline underline-offset-4">{ASK_DIFFERENT_LABEL}</Link>
      </article>
    </AppShell>
  );
}
