import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pickStarterQuestions, type StarterQuestion } from "@/content/starter-questions";
import { QUESTION_EXAMPLES_HEADING, QUESTION_EXAMPLES_SHUFFLE } from "@/lib/brand";

// Device memory only: returning to a page restores its examples without storage writes.
const pageExamples = new Map<string, StarterQuestion[]>();

export function StarterQuestions() {
  const pageKey = useLocation({ select: (location) => location.href });
  const [examples, setExamples] = useState<StarterQuestion[]>([]);
  useEffect(() => {
    const selected = pageExamples.get(pageKey) ?? pickStarterQuestions();
    pageExamples.set(pageKey, selected);
    setExamples(selected);
  }, [pageKey]);

  return <section className="space-y-3 border-t pt-4">
    <h3 className="font-sans text-sm leading-relaxed text-muted-foreground">{QUESTION_EXAMPLES_HEADING}</h3>
    <div className="grid gap-2">
      {examples.map((question) => <Link key={question.slug} to="/topic/$slug" params={{ slug: question.slug }} search={{}}
        className="flex min-h-12 items-center justify-between gap-3 py-2 text-sm leading-relaxed text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span>{question.text}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0" />
      </Link>)}
    </div>
    <Button type="button" variant="ghost" size="sm" className="min-h-12" onClick={() => {
      const selected = pickStarterQuestions(examples);
      pageExamples.set(pageKey, selected);
      setExamples(selected);
    }}>
      {QUESTION_EXAMPLES_SHUFFLE}
    </Button>
  </section>;
}