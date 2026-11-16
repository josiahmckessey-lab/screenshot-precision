import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_NAME, WELCOME_NOTICE } from "@/lib/brand";
import { ADULTS_ONLY, AGE_ACCEPTED_KEY, CONSENT_TEXT } from "@/lib/consent-text";
import { canContinueAge } from "@/lib/consent-rules";

export function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  const [checked, setChecked] = useState(false);
  const [attempted, setAttempted] = useState(false);
  return (
    <section className="fade-up flex flex-1 flex-col justify-center gap-8 py-10">
      <h1 className="text-5xl">Welcome to {APP_NAME}</h1>
      <div className="flex items-start gap-3">
        <Bot className="mt-1 size-6 shrink-0 text-primary" aria-hidden="true" />
        <p className="text-lg">{WELCOME_NOTICE}</p>
      </div>
      <p className="text-sm text-muted-foreground">Draft notice — lawyer review pending.</p>
      <label className="flex cursor-pointer items-center gap-4 text-lg">
        <Checkbox checked={checked} onCheckedChange={v => setChecked(v === true)} aria-label={CONSENT_TEXT.age} className="size-6" />
        {CONSENT_TEXT.age}
      </label>
      {attempted && !checked && <p role="alert" className="text-base text-muted-foreground">{ADULTS_ONLY}</p>}
      <Button variant="calm" size="xl" onClick={() => {
        setAttempted(true);
        if (!canContinueAge(checked)) return;
        localStorage.setItem(AGE_ACCEPTED_KEY, "true");
        onContinue();
      }}>Continue</Button>
    </section>
  );
}