import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { CrisisPanel } from "@/components/app/CrisisHelp";
import { LampIllustration } from "@/components/app/LampIllustration";
import { cn } from "@/lib/utils";
import { QuestionBox } from "@/components/app/QuestionBox";
import { Button } from "@/components/ui/button";
import { getIdeasLibrary } from "@/lib/match-topics.functions";
import { APP_DESCRIPTION, APP_NAME, ASK_ANOTHER_QUESTION, CLOSEST_SAYING_LABEL, IDEAS_ECHO_LABEL, IDEAS_LEAD_CLOSE, IDEAS_LEAD_LOOSE, MESSAGE_GUIDE, NEED_MORE_TEXT, NEED_MORE_TITLE, QUESTION_CRISIS_TEXT, QUESTION_IDEAS_HEADING, QUESTION_KNOW_MORE, QUESTION_SIT_LABEL, QUESTION_START_OVER } from "@/lib/brand";
import { clearIdeas, clearIdeasFresh, ideasEcho, isIdeasFresh, readIdeas, type IdeasResult } from "@/lib/ideas-session";

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

const TYPE_MS = 25;

// The full line stays in the page for screen readers; only the visible copy is typed out.
function TypedLine({ text, onDone }: { text: string; onDone: () => void }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (count >= text.length) { onDone(); return; }
    const id = setTimeout(() => setCount(count + 1), TYPE_MS);
    return () => clearTimeout(id);
  }, [count, text, onDone]);
  return <p className="text-lg leading-relaxed text-muted-foreground">
    <span className="sr-only">{text}</span>
    <span aria-hidden="true" data-testid="typed-line">
      {text.slice(0, count)}
      <span data-testid="typing-cursor" className="typing-cursor -mr-px inline-block h-[1.1em] w-px bg-current align-text-bottom" />
      <span className="invisible">{text.slice(count)}</span>
    </span>
  </p>;
}

function IdeasPage() {
  const { topics, deeper } = Route.useLoaderData();
  const navigate = useNavigate();
  const [result, setResult] = useState<IdeasResult | null>(null);
  const [phase, setPhase] = useState<"still" | "typing" | "done">("still");
  const [run, setRun] = useState(0);
  // Plays only for results made in this visit; a return or reload shows everything at once.
  const show = useCallback((next: IdeasResult | null) => {
    const fresh = Boolean(next) && isIdeasFresh(sessionStorage);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (fresh && reduced) clearIdeasFresh(sessionStorage);
    setResult(next);
    setPhase(fresh && !reduced ? "typing" : "still");
    setRun((n) => n + 1);
  }, []);
  const typed = useCallback(() => { clearIdeasFresh(sessionStorage); setPhase("done"); }, []);
  useEffect(() => { show(readIdeas(sessionStorage)); }, [show]);
  const lead = result?.fit === "close" ? IDEAS_LEAD_CLOSE : IDEAS_LEAD_LOOSE;
  const ideas = (result?.matches ?? []).flatMap((n) => {
    const topic = topics.find((t) => t.topic_number === n);
    return topic ? [topic] : [];
  });

  return <AppShell>
    <div className="space-y-6 py-6">
      {result?.crisis && <CrisisPanel text={QUESTION_CRISIS_TEXT} />}
      <div className="mx-auto w-full max-w-[120px]"><LampIllustration /></div>
      <h1 className="text-3xl leading-tight">{QUESTION_IDEAS_HEADING}</h1>
      {result && <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{IDEAS_ECHO_LABEL}</p>
        <blockquote className="whitespace-pre-wrap border-l-2 pl-4 text-lg leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{ideasEcho(result)}</blockquote>
      </div>}
      {result && (phase === "typing"
        ? <TypedLine key={run} text={lead} onDone={typed} />
        : <p className="text-lg leading-relaxed text-muted-foreground">{lead}</p>)}
      <div data-testid="idea-cards" className={cn("space-y-3", phase === "typing" && "pointer-events-none opacity-0", phase === "done" && "cards-fade-in")}>
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
        <QuestionBox onResults={show} />
      </section>
      <section className="space-y-3 rounded-xl border bg-card p-5 text-card-foreground">
        <h2 className="text-2xl">{NEED_MORE_TITLE}</h2>
        <p className="text-lg leading-relaxed">{NEED_MORE_TEXT}</p>
        <Button asChild><Link to="/guide" hash="message-box">{MESSAGE_GUIDE}</Link></Button>
      </section>
    </div>
  </AppShell>;
}