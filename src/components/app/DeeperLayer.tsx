import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CrisisButton } from "@/components/app/CrisisHelp";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { DeeperData } from "@/lib/deeper";
import {
  DEEPER_PROMPT, DEEPER_FITS, DEEPER_OPEN, DEEPER_ACCEPTED, DEEPER_BROWSE,
  DEEPER_NONE, DEEPER_TRY, DEEPER_SURE, DEEPER_END_TITLE, DEEPER_END_BODY,
  DEEPER_REMINDER_TITLE, DEEPER_REMINDER, DEEPER_ROOM, DEEPER_CARE,
  DEEPER_GUIDE, DEEPER_WORDS, DEEPER_RELATED,
} from "@/lib/brand";

const cardClass = "space-y-4 rounded-2xl border bg-card p-5 text-card-foreground";
const pillClass = "h-auto min-h-12 rounded-full whitespace-normal px-5 py-3 text-base";

function BrowseLink() {
  return <Link to="/about" hash="topics" className="inline-flex min-h-12 items-center underline underline-offset-4">{DEEPER_BROWSE}</Link>;
}

export function DeeperLayer({ data }: { data: DeeperData }) {
  const [mode, setMode] = useState<"initial" | "fits" | "chooser">("initial");
  const [selected, setSelected] = useState<number | "none" | null>(null);
  const entry = typeof selected === "number" ? data.entries.find((item) => item.position === selected) : undefined;

  if (mode === "fits") return <section className="space-y-2"><p className="text-lg leading-relaxed">{DEEPER_ACCEPTED}</p><BrowseLink /></section>;
  if (mode === "initial") return (
    <section className="space-y-4">
      <p className="text-lg leading-relaxed">{DEEPER_PROMPT}</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="calm" className={pillClass} onClick={() => setMode("fits")}>{DEEPER_FITS}</Button>
        <Button variant="quiet" className={pillClass} onClick={() => setMode("chooser")}>{DEEPER_OPEN}</Button>
      </div>
    </section>
  );

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl leading-snug">{data.chooser_heading}</h2>
        <div className="flex flex-wrap gap-3">
          {data.entries.map((item) => (
            <Button key={item.position} variant={selected === item.position ? "calm" : "quiet"} className={pillClass}
              aria-pressed={selected === item.position} onClick={() => setSelected(item.position)}>
              {`“${item.saying}”`}
            </Button>
          ))}
          <Button variant={selected === "none" ? "calm" : "quiet"} className={pillClass}
            aria-pressed={selected === "none"} onClick={() => setSelected("none")}>{DEEPER_NONE}</Button>
        </div>
        <div aria-live="polite" aria-atomic="true">
          {entry && (
            <section key={entry.position} className={cardClass}>
              <h3 className="text-2xl leading-snug">{entry.saying}</h3>
              <p className="whitespace-pre-line text-lg leading-relaxed">{entry.what}</p>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">{DEEPER_TRY}</p>
                <p className="whitespace-pre-line text-lg leading-relaxed">{entry.try}</p>
              </div>
              <p className="text-base text-muted-foreground">{DEEPER_SURE}: {entry.sure_label}. {entry.sure_note}</p>
            </section>
          )}
          {selected === "none" && (
            <section className={cardClass}>
              <h3 className="text-2xl leading-snug">{DEEPER_END_TITLE}</h3>
              <p className="text-lg leading-relaxed">{DEEPER_END_BODY}</p>
              <h4 className="text-xl leading-snug">{DEEPER_REMINDER_TITLE}</h4>
              <p className="text-lg leading-relaxed">{DEEPER_REMINDER}</p>
              <div><BrowseLink /><p className="text-muted-foreground">{DEEPER_ROOM}</p></div>
              <p className="text-lg leading-relaxed">{DEEPER_CARE}</p>
              <div className="flex flex-wrap items-center gap-3">
                <CrisisButton />
                <Button asChild variant="quiet" className={pillClass}><Link to="/guide">{DEEPER_GUIDE}</Link></Button>
              </div>
            </section>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl leading-snug">{data.reach_beyond.heading}</h2>
        {data.reach_beyond.lines.map((line, index) => <p key={index} className="text-lg leading-relaxed">{line}</p>)}
      </div>
      <Collapsible className="rounded-2xl border p-5">
        <CollapsibleTrigger className="min-h-12 w-full text-left text-lg font-semibold underline-offset-4 hover:underline">{DEEPER_WORDS}</CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <dl className="space-y-4">{data.words.map((word) => <div key={word.term}><dt className="font-bold">{word.term}</dt><dd className="text-lg leading-relaxed">{word.def}</dd></div>)}</dl>
        </CollapsibleContent>
      </Collapsible>
      <div className="space-y-2">
        <h2 className="text-2xl leading-snug">{DEEPER_RELATED}</h2>
        <ul>{data.related.map((topic) => <li key={topic.slug}><Link to="/topic/$slug" params={{ slug: topic.slug }} className="inline-flex min-h-12 items-center underline underline-offset-4">{topic.title}</Link></li>)}</ul>
      </div>
    </section>
  );
}