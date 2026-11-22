import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { DeeperData } from "@/lib/deeper";
import {
  DEEPER_PROMPT, DEEPER_FITS, DEEPER_OPEN, DEEPER_ACCEPTED,
  DEEPER_NONE, DEEPER_WORDS, DEEPER_RELATED, showAllSayingsLabel,
} from "@/lib/brand";

const pillClass = "h-auto min-h-12 rounded-full whitespace-normal px-5 py-3 text-base";

export function DeeperLayer({ data, slug, chooserOpen, fits, allOpen, wordsOpen, onFit, onChoose, onAll, onWords }: {
  data: DeeperData; slug: string; chooserOpen: boolean; fits: boolean; allOpen: boolean; wordsOpen: boolean;
  onFit: () => void; onChoose: () => void; onAll: () => void; onWords: (open: boolean) => void;
}) {
  if (fits && !chooserOpen) return <section className="space-y-2"><p className="text-lg leading-relaxed">{DEEPER_ACCEPTED}</p></section>;
  if (!chooserOpen) return (
    <section className="space-y-4">
      <p className="text-lg leading-relaxed">{DEEPER_PROMPT}</p>
      <div className="flex flex-wrap gap-3">
        <Button variant="calm" className={pillClass} onClick={onFit}>{DEEPER_FITS}</Button>
        <Button variant="quiet" className={pillClass} onClick={onChoose}>{DEEPER_OPEN}</Button>
      </div>
    </section>
  );

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl leading-snug">{data.chooser_heading}</h2>
        <ul className="space-y-3">
          {(allOpen ? data.entries : data.entries.slice(0, 4)).map((item) => (
            <li key={item.position}><Button asChild variant="quiet" className={`${pillClass} w-full justify-start text-left`}>
              <Link to="/topic/$slug/more/$position" params={{ slug, position: String(item.position) }} search={{}}>{`“${item.saying}”`}</Link>
            </Button></li>
          ))}
          {!allOpen && data.entries.length > 4 && <li><Button variant="ghost" className="min-h-12 whitespace-normal text-base text-muted-foreground underline underline-offset-4" onClick={onAll}>{showAllSayingsLabel(data.entries.length)}</Button></li>}
          <li><Button asChild variant="quiet" className={`${pillClass} w-full justify-start text-left`}>
            <Link to="/topic/$slug/more/none" params={{ slug }} search={{}}>{DEEPER_NONE}</Link>
          </Button></li>
        </ul>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl leading-snug">{data.reach_beyond.heading}</h2>
        {data.reach_beyond.lines.map((line, index) => <p key={index} className="text-lg leading-relaxed">{line}</p>)}
      </div>
      <Collapsible open={wordsOpen} onOpenChange={onWords} className="rounded-2xl border p-5">
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