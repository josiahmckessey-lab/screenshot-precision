import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { CrisisNote } from "@/components/app/CrisisNote";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${APP_NAME} — ${APP_TAGLINE}` },
      {
        name: "description",
        content:
          "Describe what's happening and get a short, calm reply from an AI companion. For adults 18 and over.",
      },
      { property: "og:title", content: `${APP_NAME} — ${APP_TAGLINE}` },
      { property: "og:description", content: "A calm AI companion for hard days. For adults 18+." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <AppShell>
      <section className="fade-up flex flex-1 flex-col justify-center gap-10 py-10">
        <div className="space-y-5">
          <h1 className="text-5xl sm:text-6xl">{APP_TAGLINE}</h1>
          <p className="text-xl text-muted-foreground">
            Describe what's happening. You'll get a short, calm reply to help you take the next
            step.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-start gap-3">
            <Bot className="mt-1 size-6 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-lg">
              <strong className="font-semibold">This is an AI, not a person.</strong> It can get
              things wrong. It never diagnoses, and it is no substitute for a doctor or emergency
              help.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-6 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-lg">
              For adults 18 and over. No ads, no tracking. Nothing is saved unless you turn saving
              on.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <Button asChild variant="calm" size="xl">
            <Link to="/auth">Begin</Link>
          </Button>
          <CrisisNote />
        </div>
      </section>
    </AppShell>
  );
}
