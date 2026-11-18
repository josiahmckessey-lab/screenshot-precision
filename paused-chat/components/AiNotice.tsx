import { Bot } from "lucide-react";

import { AI_NOTICE } from "@/lib/brand";

export function AiNotice() {
  return (
    <div
      role="note"
      className="flex items-start gap-3 rounded-2xl border border-border bg-sage-soft px-4 py-3 text-base text-secondary-foreground"
    >
      <Bot className="mt-1 size-5 shrink-0" aria-hidden="true" />
      <p>{AI_NOTICE}</p>
    </div>
  );
}
