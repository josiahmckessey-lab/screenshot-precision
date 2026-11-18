import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AgeGate } from "@/components/app/AgeGate";
import { AppShell } from "@/components/app/AppShell";
import { ConsentChoices } from "@/components/app/ConsentChoices";
import { Button } from "@/components/ui/button";
import { finishConsent } from "@/lib/account.functions";
import { APP_NAME } from "@/lib/brand";
import { profileQuery } from "@/lib/profile-query";
import { CONSENT_VERSION } from "@/lib/consent-text";

export const Route = createFileRoute("/_authenticated/consent")({
  head: () => ({ meta: [
    { title: `Your choices — ${APP_NAME}` },
    { name: "description", content: "Choose whether to save conversations or allow builder review. Both are optional." },
    { property: "og:title", content: `Your choices — ${APP_NAME}` },
    { property: "og:description", content: "Saving and builder review are off by default." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: ConsentPage,
});

function ConsentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const finish = useServerFn(finishConsent);
  const [busy, setBusy] = useState(false);
  const mutation = useMutation({ mutationFn: () => finish({ data: { version: CONSENT_VERSION } }), onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: profileQuery.queryKey });
    navigate({ to: "/verse-choice", replace: true });
  } });
  return <AppShell><AgeGate>
    <section className="fade-up flex flex-1 flex-col justify-center gap-8 py-8">
      <h1 className="text-4xl">Your choices</h1>
      <p className="text-lg text-muted-foreground">Both choices are optional. You can continue with both off and change them any time.</p>
      <ConsentChoices onBusyChange={setBusy} />
      {mutation.error && <p role="alert" className="text-base text-destructive">{mutation.error.message}</p>}
      <Button variant="calm" size="xl" disabled={busy || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Continuing…" : "Continue"}</Button>
    </section>
  </AgeGate></AppShell>;
}