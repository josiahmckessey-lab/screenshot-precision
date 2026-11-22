import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { DeeperData } from "@/lib/deeper";
import {
  DEEPER_PROMPT, DEEPER_FITS, DEEPER_OPEN, DEEPER_ACCEPTED, DEEPER_BROWSE,
  DEEPER_NONE, DEEPER_WORDS, DEEPER_RELATED,
} from "@/lib/brand";

const pillClass = "h-auto min-h-12 rounded-full whitespace-normal px-5 py-3 text-base";

function BrowseLink() {
  return <Link to="/about" hash="topics" className="inline-flex min-h-12 items-center underline underline-offset-4">{DEEPER_BROWSE}</Link>;
}

export function DeeperLayer({ data, slug, chooserOpen }: { data: DeeperData; slug: string; chooserOpen?: boolean | undefined }) {
  const [mode, setMode] = useState<"initial" | "fits" | "chooser">(chooserOpen ? "chooser" : "initial");

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
        <ul className="space-y-3">
          {data.entries.map((item) => (
            <li key={item.position}><Button asChild variant="quiet" className={`${pillClass} w-full justify-start text-left`}>
              <Link to="/topic/$slug/more/$position" params={{ slug, position: String(item.position) }} search={{}}>{`“${item.saying}”`}</Link>
            </Button></li>
          ))}
          <li><Button asChild variant="quiet" className={`${pillClass} w-full justify-start text-left`}>
            <Link to="/topic/$slug/more/none" params={{ slug }} search={{}}>{DEEPER_NONE}</Link>
          </Button></li>
        </ul>
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