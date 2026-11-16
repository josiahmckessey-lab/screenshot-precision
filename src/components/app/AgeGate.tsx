import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { confirmAge } from "@/lib/account.functions";
import { ADULTS_ONLY, AGE_ACCEPTED_KEY, CONSENT_TEXT } from "@/lib/consent-text";
import { profileQuery } from "@/lib/profile-query";

// Shows the 18+ confirmation step until the person confirms; then renders children.
export function AgeGate({ children }: { children: ReactNode }) {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const queryClient = useQueryClient();
  const confirm = useServerFn(confirmAge);
  const [checked, setChecked] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const mutation = useMutation({
    mutationFn: () => confirm({ data: { confirmed: true } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileQuery.queryKey }),
  });

  useEffect(() => {
    if (!profile.age_confirmed_at && localStorage.getItem(AGE_ACCEPTED_KEY) === "true") mutation.mutate();
  }, [profile.age_confirmed_at]);

  if (profile.age_confirmed_at) return <>{children}</>;
  if (mutation.isPending) return <p role="status" className="py-10 text-lg text-muted-foreground">Continuing…</p>;

  return (
    <section className="fade-up flex flex-1 flex-col justify-center gap-8 py-10">
      <div className="space-y-4">
        <h1 className="text-4xl">Before we begin</h1>
        <p className="text-lg text-muted-foreground">
          This pilot is for adults only. Please confirm your age.
        </p>
      </div>
      <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-card p-5 text-lg shadow-soft">
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
          className="size-6"
          aria-label={CONSENT_TEXT.age}
        />
        <span>{CONSENT_TEXT.age}</span>
      </label>
      {mutation.error && (
        <p role="alert" className="text-base text-destructive">
          {mutation.error.message}
        </p>
      )}
      {attempted && !checked && <p role="alert" className="text-base text-muted-foreground">{ADULTS_ONLY}</p>}
      <Button
        variant="calm"
        size="xl"
        disabled={mutation.isPending}
        onClick={() => {
          setAttempted(true);
          if (!checked) return;
          localStorage.setItem(AGE_ACCEPTED_KEY, "true");
          mutation.mutate();
        }}
      >
        {mutation.isPending ? "Saving…" : "Continue"}
      </Button>
    </section>
  );
}
