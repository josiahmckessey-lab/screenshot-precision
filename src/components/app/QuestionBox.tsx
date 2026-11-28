import { useServerFn } from "@tanstack/react-start";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CrisisPanel } from "@/components/app/CrisisHelp";
import { ArrowRight, ArrowUp } from "lucide-react";
import { LampMark } from "@/components/app/LampIllustration";
import { pickStarterChips, type StarterQuestion } from "@/content/starter-questions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { QUESTION_CRISIS_TEXT, QUESTION_ERROR, QUESTION_EXAMPLES_LINK, QUESTION_FINDING, QUESTION_HANDLED_LINK, QUESTION_PLACEHOLDER, QUESTION_SEND, QUESTION_SHOW_OTHERS, QUESTION_TITLE, QUESTION_TOPIC_TITLE } from "@/lib/brand";
import { saveIdeas, type IdeasResult } from "@/lib/ideas-session";
import { match_topics } from "@/lib/match-topics.functions";
import { canSend, hasCrisisPhrase, RATE_MS } from "@/lib/question-match";
import { pickTopicNumbers, sanitizeMatches, sanitizeSayings } from "@/lib/match-topics";

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
  const [chips, setChips] = useState<StarterQuestion[]>([]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  // Chosen after mount so the server and the first browser render match.
  useEffect(() => { setChips(pickStarterChips()); }, []);
  // Grow with the text; the style sheet caps the height, after which it scrolls.
  useEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    // Left to the one row minimum while empty, so the hint text never stretches the box.
    if (body) el.style.height = `${el.scrollHeight}px`;
  }, [body]);

  function fillFromChip(text: string) {
    setBody(text);
    if (state !== "sending") setState("idle");
    textarea.current?.focus();
  }

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
        sayings: result?.ok && sanitizeMatches(result.matches).length ? sanitizeSayings(result.sayings, result.matches) : {},
        fit: result?.ok && sanitizeMatches(result.matches).length && result.fit === "close" ? "close" : "loose",
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

  const hasText = Boolean(body.trim());
  const isSending = state === "sending";

  return <div className="space-y-4">
    {crisis && <CrisisPanel text={QUESTION_CRISIS_TEXT} />}
    <Textarea ref={textarea} aria-label={topicSlug ? QUESTION_TOPIC_TITLE : QUESTION_TITLE} value={body} maxLength={2000} rows={1}
      placeholder={QUESTION_PLACEHOLDER}
      className={cn("max-h-[15.5rem] min-h-14 resize-none overflow-y-auto rounded-2xl px-4 py-3.5 text-lg leading-7 transition-opacity placeholder:truncate placeholder:text-base md:text-lg", isSending && "opacity-60")}
      onChange={(e) => { setBody(e.target.value); if (state !== "sending") setState("idle"); }}
      onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void send(); } }} />
    <div className="flex min-h-12 items-center gap-3">
      <div className="min-w-0 flex-1">
        {isSending && <p role="status" className="flex items-center gap-2 text-muted-foreground">
          <span data-testid="sending-lamp" className="shrink-0 motion-safe:animate-pulse"><LampMark className="size-6 shrink-0" /></span>{QUESTION_FINDING}
        </p>}
        {state === "error" && <p role="alert" className="text-destructive">{QUESTION_ERROR}</p>}
      </div>
      <Button type="button" size="icon" variant={hasText ? "calm" : "secondary"} aria-label={QUESTION_SEND} onClick={send}
        disabled={!hasText || paused || isSending} className="size-12 shrink-0 rounded-full [&_svg]:size-5">
        <ArrowUp aria-hidden="true" />
      </Button>
    </div>
    {chips.length > 0 && <div className="space-y-1">
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => <li key={chip.text}>
          <button type="button" onClick={() => fillFromChip(chip.text)}
            className="min-h-11 rounded-2xl border border-border px-4 py-2 text-left text-sm leading-snug text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
            {chip.text}
          </button>
        </li>)}
      </ul>
      <button type="button" onClick={() => setChips((shown) => pickStarterChips(shown))}
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-4">{QUESTION_SHOW_OTHERS}</button>
    </div>}
    <Link to="/privacy" className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-4">{QUESTION_HANDLED_LINK}</Link>
    {topicSlug && <Link to="/examples" className="flex min-h-12 items-center justify-between gap-3 py-2 text-sm leading-relaxed text-muted-foreground underline underline-offset-4">
      <span>{QUESTION_EXAMPLES_LINK}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0" />
    </Link>}
  </div>;
}
