import { createFileRoute, Link, notFound, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Streamdown } from "streamdown";

import { AppShell } from "@/components/app/AppShell";
import { QuestionBox } from "@/components/app/QuestionBox";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import {
  APP_NAME, DEPTH_TITLES, FIND_GUIDE, KNOW_MORE_LABEL, QUESTION_TITLE, SCRIPTURE_LABEL,
  TOPIC_FOOTER, TOPIC_PICTURE_LABEL, TOPIC_SENTENCE_LABEL, TRY_LABEL,
} from "@/lib/brand";

type ScriptureItem = { heading: string; verse: string; reference: string };

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
          ? [{ heading: String(o.heading ?? ""), verse: o.verse, reference: String(o.reference ?? "") }]
          : [];
      })
    : [];
  return { ...data, scripture };
}

export const Route = createFileRoute("/topic/$slug")({
  loader: ({ params }) => loadTopic(params.slug),
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.title} — ${APP_NAME}` : `Topic — ${APP_NAME}`;
    const desc = loaderData?.sentence ?? "A topic page in the library.";
    return {
      meta: [
        { title }, { name: "description", content: desc },
        { property: "og:title", content: title }, { property: "og:description", content: desc },
        { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: TopicPage,
  errorComponent: TopicError,
  notFoundComponent: () => (
    <AppShell>
      <div className="space-y-4 py-8">
        <BackLink />
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
        <BackLink />
        <p className="text-lg">{error instanceof Error ? error.message : "Something went wrong."}</p>
        <Button onClick={() => { router.invalidate(); reset(); }}>Try again</Button>
      </div>
    </AppShell>
  );
}

function BackLink() {
  return <Link to="/" className="text-base underline underline-offset-4">← Back to home</Link>;
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

function TopicPage() {
  const t = Route.useLoaderData();
  const [depth, setDepth] = useState(0);
  const levels = [t.level1, t.level2, t.level3];
  const tryCard = <Card label={TRY_LABEL}><Md text={t.try_text} /></Card>;

  return (
    <AppShell>
      <article className="space-y-6 py-4">
        <BackLink />
        <h1 className="text-4xl leading-tight sm:text-5xl">{t.title}</h1>
        <Card label={TOPIC_PICTURE_LABEL}><Md text={t.picture} /></Card>
        <Card label={TOPIC_SENTENCE_LABEL}><p className="text-2xl leading-snug">{t.sentence}</p></Card>

        {levels.slice(0, depth).map((text, i) => (
          <div key={i} className="space-y-6">
            <Card label={DEPTH_TITLES[i]}><Md text={text} /></Card>
            {i === 0 && tryCard}
          </div>
        ))}
        {depth < 3 && (
          <Button size="lg" variant="outline" onClick={() => setDepth((d) => d + 1)}>{KNOW_MORE_LABEL}</Button>
        )}
        {depth === 0 && tryCard}

        {t.scripture.length > 0 && (
          <Collapsible className="rounded-2xl border p-5">
            <CollapsibleTrigger className="w-full text-left text-lg font-semibold underline-offset-4 hover:underline">
              {SCRIPTURE_LABEL}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 pt-4">
              {t.scripture.map((s, i) => (
                <div key={i} className="space-y-2">
                  {s.heading && <p className="font-bold">{s.heading}</p>}
                  <blockquote className="whitespace-pre-line border-l-4 pl-4 text-lg italic">{s.verse}</blockquote>
                  <p className="text-muted-foreground">{s.reference}</p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        <Card label={QUESTION_TITLE}><QuestionBox topicSlug={t.slug} /></Card>

        <div className="space-y-2 pt-4">
          <Link to="/guide" className="text-lg underline underline-offset-4">{FIND_GUIDE}</Link>
          <p className="text-muted-foreground">{TOPIC_FOOTER}</p>
        </div>
      </article>
    </AppShell>
  );
}
