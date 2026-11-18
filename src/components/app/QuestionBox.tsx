import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { CrisisPanel } from "@/components/app/CrisisHelp";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  QUESTION_CRISIS_TEXT, QUESTION_ERROR, QUESTION_MATCHES, QUESTION_NOTICE, QUESTION_RECEIVED,
  QUESTION_SEND, QUESTION_START, QUESTION_WAIT,
} from "@/lib/brand";
import { bestTopics, canSend, hasCrisisPhrase, RATE_KEY } from "@/lib/question-match";

type Topic = { slug: string; title: string; topic_number: number; home_line: string };

// Anonymous question box: inserts only body + topic slug. Matching and crisis check stay on the device.
export function QuestionBox({ topicSlug }: { topicSlug?: string }) {
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "wait">("idle");
  const [crisis, setCrisis] = useState(false);
  const [suggest, setSuggest] = useState<{ matched: boolean; topics: Topic[] } | null>(null);

  async function send() {
    const text = body.trim();
    if (!text || text.length > 2000 || state === "sending") return;
    const last = Number(localStorage.getItem(RATE_KEY)) || null;
    if (!canSend(last, Date.now())) return setState("wait");
    if (hasCrisisPhrase(text)) setCrisis(true);
    setState("sending");
    const { error } = await supabase.from("questions").insert({ body: text, topic_slug: topicSlug ?? null });
    if (error) return setState("error");
    localStorage.setItem(RATE_KEY, String(Date.now()));
    const { data } = await supabase
      .from("library_pages").select("slug,title,topic_number,home_line").order("topic_number");
    const all = (data ?? []) as Topic[];
    const best = bestTopics(text, all.map((t) => t.topic_number));
    setSuggest(best
      ? { matched: true, topics: best.map((n) => all.find((t) => t.topic_number === n)!).filter(Boolean) }
      : { matched: false, topics: all.slice(0, 3) });
    setBody("");
    setState("sent");
  }

  return (
    <div className="space-y-4">
      {crisis && <CrisisPanel text={QUESTION_CRISIS_TEXT} />}
      {state === "sent" ? (
        <div className="space-y-4">
          <p role="status" className="text-lg">{QUESTION_RECEIVED}</p>
          {suggest && suggest.topics.length > 0 && (
            <div className="space-y-3">
              <p className="font-semibold">{suggest.matched ? QUESTION_MATCHES : QUESTION_START}</p>
              {suggest.topics.map((t) => (
                <Link key={t.slug} to="/topic/$slug" params={{ slug: t.slug }}
                  className="block rounded-xl border bg-background p-4 hover:bg-accent">
                  <span className="block text-lg font-semibold">{t.title}</span>
                  <span className="block text-muted-foreground">{t.home_line}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="text-base text-muted-foreground">{QUESTION_NOTICE}</p>
          <Textarea aria-label="Question" value={body} maxLength={2000} rows={4} className="text-lg"
            onChange={(e) => { setBody(e.target.value); if (state !== "sending") setState("idle"); }} />
          <div className="flex items-center gap-4">
            <Button onClick={send} disabled={!body.trim() || state === "sending"}>{QUESTION_SEND}</Button>
            {state === "wait" && <p role="status">{QUESTION_WAIT}</p>}
            {state === "error" && <p role="alert" className="text-destructive">{QUESTION_ERROR}</p>}
          </div>
        </>
      )}
    </div>
  );
}
