import { Phone } from "lucide-react";

import { CRISIS_LINE } from "@/lib/brand";

export function CrisisNote() {
  return (
    <p className="flex items-start gap-2.5 text-base text-muted-foreground">
      <Phone className="mt-1 size-4 shrink-0 text-clay" aria-hidden="true" />
      <span>
        {CRISIS_LINE}{" "}
        <a href="tel:988" className="font-semibold text-foreground underline underline-offset-4">
          Call 988
        </a>
      </span>
    </p>
  );
}
