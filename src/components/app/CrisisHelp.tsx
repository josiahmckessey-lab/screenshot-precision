import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BACK_TO_LIBRARY, CRISIS_TEXT } from "@/lib/brand";

// Marks the history entry added while the crisis panel is open, so the browser
// back button closes the panel instead of leaving the screen it was opened on.
const CRISIS_HISTORY_KEY = "crisisHelpOpen";

export function CrisisPanel({ text = CRISIS_TEXT }: { text?: string }) {
  return (
    <section
      aria-label="Crisis help"
      className="space-y-4 border-l-4 border-clay bg-clay-soft p-5 text-foreground"
    >
      <p className="text-lg leading-relaxed">{text}</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="quiet">
          <a href="tel:988"><Phone />Call 988</a>
        </Button>
        <Button asChild variant="quiet">
          <a href="sms:988"><MessageCircle />Text 988</a>
        </Button>
        <Button asChild variant="quiet">
          <a href="tel:911"><Phone />Call 911</a>
        </Button>
      </div>
      <Button asChild variant="link" className="h-auto p-0">
        <Link to="/safety">Safety page<ArrowUpRight /></Link>
      </Button>
    </section>
  );
}

export function CrisisButton() {
  const [open, setOpen] = useState(false);

  // Browser back closes the panel and leaves the person on the screen they were on.
  useEffect(() => {
    const onPopState = () => setOpen(false);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function change(next: boolean) {
    if (next === open) return;
    setOpen(next);
    if (next) {
      window.history.pushState({ ...(window.history.state ?? {}), [CRISIS_HISTORY_KEY]: true }, "");
    } else if (window.history.state?.[CRISIS_HISTORY_KEY]) {
      window.history.back();
    }
  }

  return (
    <>
      <Button variant="quiet" onClick={() => change(true)} className="h-11 px-3">
        <Phone />
        Crisis help
      </Button>
      <Dialog open={open} onOpenChange={change}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crisis help</DialogTitle>
          </DialogHeader>
          <CrisisPanel />
          <DialogClose asChild>
            <Button variant="link" className="h-auto w-fit justify-start p-0 text-base">
              {BACK_TO_LIBRARY}
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
