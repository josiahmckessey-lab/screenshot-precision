import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { CrisisPanel } from "@/components/app/CrisisHelp";
import { QuestionBox } from "@/components/app/QuestionBox";
import { Button } from "@/components/ui/button";
import { getIdeasLibrary } from "@/lib/match-topics.functions";
import { APP_DESCRIPTION, APP_NAME, ASK_ANOTHER_QUESTION, CLOSEST_SAYING_LABEL, IDEAS_LOOSE_FIT, MESSAGE_GUIDE, NEED_MORE_TEXT, NEED_MORE_TITLE, QUESTION_CRISIS_TEXT, QUESTION_IDEAS_HEADING, QUESTION_KNOW_MORE, QUESTION_SIT_LABEL, QUESTION_START_OVER } from "@/lib/brand";
import { clearIdeas, readIdeas, type IdeasResult } from "@/lib/ideas-session";

export const Route = createFileRoute("/ideas")({
  loader: () => getIdeasLibrary(),
  head: () => ({ meta: [
    { title: `Ideas that relate — ${APP_NAME}` },
    { name: "description", content: APP_DESCRIPTION },
    { property: "og:title", content: `Ideas that relate — ${APP_NAME}` },
    { property: "og:description", content: APP_DESCRIPTION },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: IdeasPage,
});

function IdeasPage() {
  const { topics, deeper } = Route.useLoaderData();
  const navigate = useNavigate();
  const [result, setResult] = useState<IdeasResult | null>(null);
  useEffect(() => { setResult(readIdeas(sessionStorage)); }, []);
  const ideas = (result?.matches ?? []).flatMap((n) => {
    const topic = topics.find((t) => t.topic_number === n);
    return topic ? [topic] : [];
  });

  return <AppShell>
    <div className="space-y-6 py-6">
      {result?.crisis && <CrisisPanel text={QUESTION_CRISIS_TEXT} />}
      <h1 className="text-3xl leading-tight">{QUESTION_IDEAS_HEADING}</h1>
      {result?.fit === "loose" && <p className="text-muted-foreground">{IDEAS_LOOSE_FIT}</p>}
      <div className="space-y-3">
        {ideas.map((t) => <section key={t.slug} className="space-y-3 rounded-xl border bg-card p-5 text-card-foreground">
          <h2 className="text-xl font-semibold">{t.title}</h2>
          <p className="text-lg leading-relaxed">{t.sentence}</p>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">{QUESTION_SIT_LABEL}</p>
          <p className="text-lg leading-relaxed">{t.home_line}</p>
          {deeper.find((row) => row.topic_number === t.topic_number)?.entries.filter((entry) => entry.position === result?.sayings?.[t.topic_number]).slice(0, 1).map((entry) => <div key={entry.position} className="space-y-1">
            <p className="text-sm text-muted-foreground">{CLOSEST_SAYING_LABEL}</p>
            <Link to="/topic/$slug/more/$position" params={{ slug: t.slug, position: String(entry.position) }} search={{}} className="inline-flex min-h-12 items-center text-lg leading-relaxed underline underline-offset-4">{entry.saying}</Link>
          </div>)}
          <Button asChild variant="outline"><Link to="/topic/$slug" params={{ slug: t.slug }} search={{ from: "ideas" }}>{QUESTION_KNOW_MORE}</Link></Button>
        </section>)}
      </div>
      <Button variant="calm" onClick={() => { clearIdeas(sessionStorage); void navigate({ to: "/" }); }}>{QUESTION_START_OVER}</Button>
      <section className="space-y-3">
        <h2 className="text-2xl">{ASK_ANOTHER_QUESTION}</h2>
        <QuestionBox onResults={setResult} />
      </section>
      <section className="space-y-3 rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-2xl">{NEED_MORE_TITLE}</h2>
        <p className="text-lg leading-relaxed">{NEED_MORE_TEXT}</p>
        <Button asChild><Link to="/guide" hash="message-box">{MESSAGE_GUIDE}</Link></Button>
      </section>
    </div>
  </AppShell>;
}