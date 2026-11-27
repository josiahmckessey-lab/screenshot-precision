import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { KEPT_CHOICES, KEPT_DONE, KEPT_QUESTION, KEPT_TOPIC_LINK, keptTopicLabel } from "@/lib/brand";
import { clearKept, isKeptReady, readKept, type KeptItem } from "@/lib/kept";
import { getKeptTopic } from "@/lib/match-topics.functions";

export function KeptCheckBack() {
  const [item, setItem] = useState<KeptItem | null>(null);
  const [answer, setAnswer] = useState<(typeof KEPT_CHOICES)[number]["id"] | null>(null);
  useEffect(() => {
    const stored = readKept();
    if (stored && isKeptReady(stored)) setItem(stored);
  }, []);
  const { data } = useQuery({
    queryKey: ["keptTopic", item?.slug],
    queryFn: () => item ? getKeptTopic({ data: { slug: item.slug } }) : null,
    enabled: item !== null,
    retry: false,
  });
  if (!item || !data) return null;
  const choice = KEPT_CHOICES.find((option) => option.id === answer);

  return <section className="space-y-4 rounded-2xl border bg-card p-5 text-card-foreground">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{keptTopicLabel(item.title)}</h2>
    <Streamdown className="prose-text space-y-4 text-lg leading-relaxed [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6">{data.try_text}</Streamdown>
    <p className="text-lg">{KEPT_QUESTION}</p>
    <div className="grid gap-3 sm:grid-cols-3">
      {KEPT_CHOICES.map((option) => <Button key={option.id} variant="outline" aria-pressed={answer === option.id}
        className="h-auto min-h-12 rounded-full whitespace-normal px-3 py-3 text-base aria-pressed:border-primary aria-pressed:bg-accent"
        onClick={() => setAnswer(option.id)}>{option.label}</Button>)}
    </div>
    {choice && <div className="space-y-3">
      <p className="text-lg leading-relaxed">{choice.reply}</p>
      <Button variant="calm" className="min-h-12" onClick={() => {
        if (clearKept()) setItem(null);
      }}>{KEPT_DONE}</Button>
    </div>}
    <Link to="/topic/$slug" params={{ slug: item.slug }} className="inline-flex min-h-12 items-center underline underline-offset-4">{KEPT_TOPIC_LINK}</Link>
  </section>;
}