import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app/AppShell";
import { AgeGate } from "@/components/app/AgeGate";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { finishVerseOffer } from "@/lib/account.functions";
import { APP_NAME } from "@/lib/brand";
import { CONSENT_VERSION, VERSE_TITLE, VERSE_OFFER } from "@/lib/consent-text";
import { profileQuery } from "@/lib/profile-query";

export const Route = createFileRoute("/_authenticated/verse-choice")({
  head: () => ({ meta: [
    { title: `An optional verse — ${APP_NAME}` },
    { name: "description", content: "Choose whether to include a Bible verse with replies." },
    { property: "og:title", content: `An optional verse — ${APP_NAME}` },
    { property: "og:description", content: "An optional choice, off unless you enable it." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  loader: async ({ context }) => {
    const p = await context.queryClient.ensureQueryData(profileQuery);
    if (p.privacy_notice_version !== CONSENT_VERSION) throw redirect({ to: "/consent" });
    if (p.verse_offered_at) throw redirect({ to: "/home" });
    return p;
  }, component: VerseChoice,
});
function VerseChoice() {
  const [enabled,setEnabled] = useState(false);
  const finish = useServerFn(finishVerseOffer);
  const navigate = useNavigate();
  const { queryClient } = Route.useRouteContext();
  const mutation = useMutation({ mutationFn: (value: boolean) => finish({ data: { enabled: value } }), onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: profileQuery.queryKey });
    navigate({ to: "/home", replace: true });
  } });
  return <AppShell><AgeGate><section className="flex flex-1 flex-col justify-center gap-8 py-10">
    <h1 className="text-4xl">An optional verse</h1>
    <p className="text-lg text-muted-foreground">{VERSE_OFFER}</p>
    <div className="flex items-start justify-between gap-5"><label htmlFor="verse-choice" className="text-lg">{VERSE_TITLE}</label><Switch id="verse-choice" checked={enabled} onCheckedChange={setEnabled} disabled={mutation.isPending} /></div>
    {mutation.error && <p role="alert" className="text-destructive">{mutation.error.message}</p>}
    <Button variant="calm" size="xl" disabled={mutation.isPending} onClick={() => mutation.mutate(enabled)}>Continue</Button>
    <Button variant="quiet" size="xl" disabled={mutation.isPending} onClick={() => mutation.mutate(false)}>Skip for now</Button>
  </section></AgeGate></AppShell>;
}