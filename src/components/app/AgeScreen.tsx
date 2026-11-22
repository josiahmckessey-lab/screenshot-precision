import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AGE_ACCEPTED_KEY, AGE_LABEL, AGE_STOP, AGE_TEXT, QUESTION_CRISIS_TEXT } from "@/lib/brand";
import { CrisisPanel } from "./CrisisHelp";
import { canContinueAge } from "@/lib/age-gate";
import { LampIllustration } from "./LampIllustration";

export function AgeScreen({ onContinue }: { onContinue: () => void }) {
  const [checked, setChecked] = useState(false);
  const [attempted, setAttempted] = useState(false);
  return (
    <section className="fade-up flex flex-1 flex-col justify-center gap-8 py-10">
      <LampIllustration />
      <h1 className="text-4xl">{AGE_TEXT}</h1>
      <label className="flex cursor-pointer items-center gap-4 text-lg">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
          aria-label={AGE_LABEL}
          className="size-6"
        />
        {AGE_LABEL}
      </label>
      {attempted && !checked && (
        <div className="space-y-4">
          <p role="alert" className="text-base text-muted-foreground">{AGE_STOP}</p>
          <CrisisPanel text={QUESTION_CRISIS_TEXT} />
        </div>
      )}
      <Button
        variant="calm"
        size="xl"
        onClick={() => {
          setAttempted(true);
          if (!canContinueAge(checked)) return;
          localStorage.setItem(AGE_ACCEPTED_KEY, "true");
          onContinue();
        }}
      >
        Continue
      </Button>
    </section>
  );
}
