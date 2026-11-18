import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { CrisisPanel } from "@/components/app/CrisisHelp";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  FIND_GUIDE,
  QUESTION_CRISIS_TEXT,
  QUESTION_ENDS,
  QUESTION_ERROR,
  QUESTION_IDEAS_HEADING,
  QUESTION_KNOW_MORE,
  QUESTION_NOTICE,
  QUESTION_SEND,
  QUESTION_SIT_LABEL,
  QUESTION_START_OVER,
  QUESTION_WAIT,
} from "@/lib/brand";
import { match_topics } from "@/lib/match-topics.functions";
import { canSend, hasCrisisPhrase, RATE_KEY } from "@/lib/question-match";
import { pickTopicNumbers } from "@/lib/match-topics";

type Topic = {
  slug: string;
  title: string;
  topic_number: number;
  home_line: string;
  sentence: string;
};

// Anonymous question box: saves only body + topic slug, then asks the server sorter for
// up to 3 topic numbers. Only numbers come back; text from the model is never shown.
export function QuestionBox({ topicSlug }: { topicSlug?: string }) {
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "wait">("idle");
  const [crisis, setCrisis] = useState(false);
  const [ideas, setIdeas] = useState<Topic[]>([]);
  const askSorter = useServerFn(match_topics);

  async function send() {
    const text = body.trim();
    if (!text || text.length > 2000 || state === "sending") return;
    const last = Number(localStorage.getItem(RATE_KEY)) || null;
    if (!canSend(last, Date.now())) return setState("wait");
    // On-device danger words first: the panel never waits on a cap, a call or a model.
    if (hasCrisisPhrase(text)) setCrisis(true);
    setState("sending");
    const { error } = await supabase
      .from("questions")
      .insert({ body: text, topic_slug: topicSlug ?? null });
    if (error) return setState("error");
    localStorage.setItem(RATE_KEY, String(Date.now()));

    const { data } = await supabase
      .from("library_pages")
      .select("slug,title,topic_number,home_line,sentence")
      .eq("status", "active")
      .order("topic_number");
    const all = (data ?? []) as Topic[];

    const result = await askSorter({ data: { text } }).catch(() => null);
    if (result?.crisis) setCrisis(true);
    const picked = pickTopicNumbers(
      result ? { ok: result.ok, matches: result.matches } : null,
      text,
      all.map((t) => t.topic_number),
    );
    setIdeas(
      picked
        .map((n) => all.find((t) => t.topic_number === n))
        .filter((t): t is Topic => Boolean(t)),
    );
    setBody("");
    setState("sent");
  }

  function startOver() {
    setIdeas([]);
    setCrisis(false);
    setBody("");
    setState("idle");
  }

  return (
    <div className="space-y-4">
      {crisis && <CrisisPanel text={QUESTION_CRISIS_TEXT} />}
      {state === "sent" ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{QUESTION_IDEAS_HEADING}</h3>
          <div className="space-y-3">
            {ideas.map((t) => (
              <section key={t.slug} className="space-y-2 rounded-xl border bg-background p-4">
                <p className="text-lg font-semibold">{t.title}</p>
                <p className="text-base leading-relaxed">{t.sentence}</p>
                <p className="text-sm uppercase tracking-wide text-muted-foreground">
                  {QUESTION_SIT_LABEL}
                </p>
                <p className="text-base leading-relaxed">{t.home_line}</p>
                <Button asChild size="sm" variant="outline">
                  <Link to="/topic/$slug" params={{ slug: t.slug }}>
                    {QUESTION_KNOW_MORE}
                  </Link>
                </Button>
              </section>
            ))}
          </div>
          <p className="text-base leading-relaxed">
            {QUESTION_ENDS}{" "}
            <Link to="/guide" className="underline underline-offset-4">
              {FIND_GUIDE}
            </Link>
          </p>
          <Button variant="calm" onClick={startOver}>
            {QUESTION_START_OVER}
          </Button>
        </div>
      ) : (
        <>
          <p className="text-base text-muted-foreground">{QUESTION_NOTICE}</p>
          <Textarea
            aria-label="Question"
            value={body}
            maxLength={2000}
            rows={4}
            className="text-lg"
            onChange={(e) => {
              setBody(e.target.value);
              if (state !== "sending") setState("idle");
            }}
          />
          <div className="flex items-center gap-4">
            <Button onClick={send} disabled={!body.trim() || state === "sending"}>
              {QUESTION_SEND}
            </Button>
            {state === "wait" && <p role="status">{QUESTION_WAIT}</p>}
            {state === "error" && (
              <p role="alert" className="text-destructive">
                {QUESTION_ERROR}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
