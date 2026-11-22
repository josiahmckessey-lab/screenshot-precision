import { useCallback, useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { INTRO_LINES } from "@/content/about";
import { INTRO_FADE_OUT_MS } from "@/lib/welcome-intro";

export function WelcomeIntro({ onFinish }: { onFinish: () => void }) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [reduced, setReduced] = useState<boolean | null>(null);
  const transition = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishing = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => () => {
    if (transition.current !== null) clearTimeout(transition.current);
  }, []);

  const finish = useCallback(() => {
    if (finishing.current) return;
    finishing.current = true;
    if (transition.current !== null) clearTimeout(transition.current);
    onFinish();
  }, [onFinish]);

  const advance = useCallback(() => {
    if (leaving || finishing.current || reduced === null) return;
    const next = () => {
      if (index === INTRO_LINES.length - 1) finish();
      else {
        setIndex((current) => current + 1);
        setLeaving(false);
      }
    };
    if (reduced) next();
    else {
      setLeaving(true);
      transition.current = setTimeout(next, INTRO_FADE_OUT_MS);
    }
  }, [finish, index, leaving, reduced]);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-xl flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="flex shrink-0 items-center justify-between gap-2 py-3">
        <Wordmark />
      </header>
      <main className="flex min-h-0 flex-1">
        <Button
          variant="ghost"
          onClick={advance}
          className="h-auto w-full flex-col whitespace-normal rounded-none px-0 py-6 hover:bg-transparent hover:text-foreground"
        >
          <span aria-live="polite" aria-atomic="true">
            <span key={index} className={`block space-y-6 ${reduced ? "" : leaving ? "intro-fade-out" : "intro-fade-in"}`}>
              <span className="block font-display text-3xl font-medium leading-relaxed sm:text-4xl">{INTRO_LINES[index]}</span>
              <span className="block text-sm font-normal text-muted-foreground">Next</span>
            </span>
          </span>
        </Button>
      </main>
      <div className="flex shrink-0 flex-col items-center gap-3 pt-3">
        <Button variant="link" onClick={finish} className="h-12 min-h-11 px-8 text-base">Skip</Button>
      </div>
    </div>
  );
}