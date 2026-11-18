import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CRISIS_TEXT } from "@/lib/brand";

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
  return (
    <>
      <Button variant="quiet" onClick={() => setOpen(true)} className="h-11 px-3">
        <Phone />
        Crisis help
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crisis help</DialogTitle>
          </DialogHeader>
          <CrisisPanel />
        </DialogContent>
      </Dialog>
    </>
  );
}
