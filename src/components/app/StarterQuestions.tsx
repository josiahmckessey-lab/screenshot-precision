import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { pickStarterQuestions } from "@/content/starter-questions";
import { QUESTION_EXAMPLES_HEADING, QUESTION_EXAMPLES_SHUFFLE } from "@/lib/brand";

export function StarterQuestions({ onSelect, disabled }: { onSelect: (question: string) => void; disabled: boolean }) {
  const [examples, setExamples] = useState<string[]>([]);
  useEffect(() => { setExamples(pickStarterQuestions()); }, []);

  return <section className="space-y-3 border-t pt-4">
    <h3 className="font-sans text-sm leading-relaxed text-muted-foreground">{QUESTION_EXAMPLES_HEADING}</h3>
    <div className="grid gap-2">
      {examples.map((question) => <Button key={question} type="button" variant="outline" disabled={disabled}
        className="h-auto min-h-11 justify-start whitespace-normal px-3 py-3 text-left text-sm leading-relaxed"
        onClick={() => onSelect(question)}>{question}</Button>)}
    </div>
    <Button type="button" variant="ghost" size="sm" onClick={() => setExamples(pickStarterQuestions(examples))}>
      {QUESTION_EXAMPLES_SHUFFLE}
    </Button>
  </section>;
}