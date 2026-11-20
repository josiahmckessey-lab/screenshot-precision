import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CrisisPanel } from "@/components/app/CrisisHelp";
import { StarterQuestions } from "@/components/app/StarterQuestions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { QUESTION_CRISIS_TEXT, QUESTION_ERROR, QUESTION_NOTICE, QUESTION_SEND, QUESTION_TITLE, QUESTION_TOPIC_TITLE } from "@/lib/brand";
import { saveIdeas, type IdeasResult } from "@/lib/ideas-session";
import { match_topics } from "@/lib/match-topics.functions";
import { canSend, hasCrisisPhrase, RATE_MS } from "@/lib/question-match";
import { pickTopicNumbers } from "@/lib/match-topics";

export function QuestionBox({ topicSlug, onResults }: { topicSlug?: string; onResults?: (result: IdeasResult) => void }) {
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [paused, setPaused] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const lastPress = useRef<number | null>(null);
  const sending = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const askSorter = useServerFn(match_topics);
  const navigate = useNavigate();
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function send() {
    const text = body.trim();
    if (!text || text.length > 2000) return;
    const localCrisis = hasCrisisPhrase(text);
    if (localCrisis) setCrisis(true);
    if (sending.current || !canSend(lastPress.current, Date.now())) return;
    lastPress.current = Date.now();
    sending.current = true;
    setPaused(true);
    timer.current = setTimeout(() => setPaused(false), RATE_MS);
    setState("sending");
    try {
      // Save through the database function so the daily limit is enforced in one place.
      // The generated types mark _topic_slug as non-null; the function itself accepts null.
      const { data: savedId, error } = await supabase.rpc("submit_question", {
        _topic_slug: topicSlug ?? null,
        _body: text,
      } as { _body: string; _topic_slug: string });
      if (error) throw error;
      if (!savedId) throw new Error("question_limit");
      const { data } = await supabase.from("library_pages").select("topic_number").eq("status", "active");
      const result = await askSorter({ data: { text } }).catch(() => null);
      const ideas: IdeasResult = {
        text,
        matches: pickTopicNumbers(result, text, (data ?? []).map((t) => t.topic_number)),
        crisis: localCrisis || result?.crisis === true,
      };
      saveIdeas(sessionStorage, ideas);
      onResults?.(ideas);
      setBody("");
      setCrisis(false);
      setState("idle");
      await navigate({ to: "/ideas", replace: Boolean(onResults) });
    } catch {
      setState("error");
    } finally {
      sending.current = false;
    }
  }

  return <div className="space-y-4">
    {crisis && <CrisisPanel text={QUESTION_CRISIS_TEXT} />}
    <div className="space-y-1">
      <p className="text-base text-muted-foreground">{QUESTION_NOTICE}</p>
      <Link to="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">How this is handled</Link>
    </div>
    <Textarea ref={textarea} aria-label={topicSlug ? QUESTION_TOPIC_TITLE : QUESTION_TITLE} value={body} maxLength={2000} rows={4} className="text-lg"
      onChange={(e) => { setBody(e.target.value); if (state !== "sending") setState("idle"); }} />
    <div className="flex flex-wrap items-center gap-4">
      <Button onClick={send} disabled={!body.trim() || paused || state === "sending"}>{QUESTION_SEND}</Button>
      {state === "error" && <p role="alert" className="text-destructive">{QUESTION_ERROR}</p>}
    </div>
    <StarterQuestions />
  </div>;
}