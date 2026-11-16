import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { confirmAge } from "@/lib/account.functions";
import { CONSENT_TEXT } from "@/lib/consent-text";
import { profileQuery } from "@/lib/profile-query";

// Shows the 18+ confirmation step until the person confirms; then renders children.
export function AgeGate({ children }: { children: ReactNode }) {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const queryClient = useQueryClient();
  const confirm = useServerFn(confirmAge);
  const [checked, setChecked] = useState(false);
  const mutation = useMutation({
    mutationFn: () => confirm(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileQuery.queryKey }),
  });

  if (profile.age_confirmed_at) return <>{children}</>;

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
      <Button
        variant="calm"
        size="xl"
        disabled={!checked || mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? "Saving…" : "Continue"}
      </Button>
    </section>
  );
}
