import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ASK_DIFFERENT_LABEL, DEEPER_BROWSE, KEEP_LATER_LABEL, KEPT_CONFIRMATION, LANDING_CHOICES, SEE_SAYINGS_LABEL } from "@/lib/brand";
import { saveKept } from "@/lib/kept";

export function TopicLanding({ slug, title, hasDeeper, onChoose }: {
  slug: string; title: string; hasDeeper: boolean; onChoose: () => void;
}) {
  const [answer, setAnswer] = useState<(typeof LANDING_CHOICES)[number]["id"] | null>(null);
  const [kept, setKept] = useState(false);
  const choice = LANDING_CHOICES.find((item) => item.id === answer);
  const ask = <Link to="/ask" search={{ topic: slug }} className="inline-flex min-h-12 items-center underline underline-offset-4">{ASK_DIFFERENT_LABEL}</Link>;

  return <div className="space-y-4">
    <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-4">
      {LANDING_CHOICES.map((item) => <Button key={item.id} variant="outline" aria-pressed={answer === item.id}
        className="h-auto min-h-12 rounded-full whitespace-normal px-3 py-3 text-base aria-pressed:border-primary aria-pressed:bg-accent"
        onClick={() => setAnswer(item.id)}>{item.label}</Button>)}
    </div>
    {choice && <div className="space-y-3">
      <p className="text-lg leading-relaxed">{choice.reply}</p>
      {(answer === "fits" || answer === "curious") && (kept
        ? <p className="text-muted-foreground" role="status">{KEPT_CONFIRMATION}</p>
        : <Button variant="calm" className="h-auto min-h-12 whitespace-normal" onClick={() => {
          if (saveKept({ slug, title, at: Date.now() })) setKept(true);
        }}>{KEEP_LATER_LABEL}</Button>)}
      {answer === "part" && (hasDeeper
        ? <Button variant="calm" className="min-h-12" onClick={onChoose}>{SEE_SAYINGS_LABEL}</Button>
        : ask)}
      {answer === "not" && <div className="flex flex-wrap gap-x-5 gap-y-2">
        {ask}
        <Link to="/about" hash="topics" className="inline-flex min-h-12 items-center underline underline-offset-4">{DEEPER_BROWSE}</Link>
      </div>}
    </div>}
  </div>;
}