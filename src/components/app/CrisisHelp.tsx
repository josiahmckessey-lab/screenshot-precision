import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SAFETY_RESPONSE } from "@/lib/brand";

export function CrisisPanel({ text = SAFETY_RESPONSE }: { text?: string }) {
  return (
    <section
      aria-label="Crisis help"
      className="space-y-4 border-l-4 border-clay bg-clay-soft p-5 text-foreground"
    >
      <h2 className="text-2xl">Help right now</h2>
      <p className="text-base leading-relaxed">{text}</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="quiet">
          <a href="tel:988">
            <Phone />
            Call 988
          </a>
        </Button>
        <Button asChild variant="quiet">
          <a href="sms:988">
            <MessageCircle />
            Text 988
          </a>
        </Button>
        <Button asChild variant="quiet">
          <a href="tel:911">
            <Phone />
            Call 911
          </a>
        </Button>
      </div>
      <p className="text-sm">
        988 is available in the US. Call 911 for immediate danger. Outside the US, call your local
        emergency number.
      </p>
      <Button asChild variant="link" className="h-auto p-0">
        <Link to="/safety">
          Safety page
          <ArrowUpRight />
        </Link>
      </Button>
    </section>
  );
}
