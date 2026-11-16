import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Settings } from "lucide-react";

import { AgeGate } from "@/components/app/AgeGate";
import { AiNotice } from "@/components/app/AiNotice";
import { AppShell } from "@/components/app/AppShell";
import { CrisisNote } from "@/components/app/CrisisNote";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { APP_NAME } from "@/lib/brand";
import { profileQuery } from "@/lib/profile-query";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: `Talk it through — ${APP_NAME}` },
      { name: "description", content: "Describe what's happening and get a short, calm reply." },
      { property: "og:title", content: `Talk it through — ${APP_NAME}` },
      { property: "og:description", content: "A calm AI companion for hard days." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: async ({ context }) => {
    const profile = await context.queryClient.ensureQueryData(profileQuery);
    if (!profile.consent_reviewed_at) throw redirect({ to: "/consent" });
    return profile;
  },
  component: HomePage,
});

function SettingsLink() {
  return (
    <Button asChild variant="ghost" size="icon" className="size-11 rounded-full">
      <Link to="/settings" aria-label="Settings">
        <Settings className="size-6" />
      </Link>
    </Button>
  );
}

function HomePage() {
  return (
    <AppShell nav={<SettingsLink />}>
      <AgeGate>
        <section className="fade-up flex flex-1 flex-col gap-8 py-6">
          <AiNotice />
          <div className="flex flex-1 flex-col justify-center gap-6">
            <h1 className="text-4xl">What's happening today?</h1>
            <Textarea
              disabled
              placeholder="Replies are being prepared and will open here soon."
              className="min-h-40 rounded-3xl bg-card p-5 text-lg md:text-lg"
              aria-label="Describe your situation"
            />
            <Button variant="calm" size="xl" disabled>
              Get a reply
            </Button>
          </div>
          <CrisisNote />
        </section>
      </AgeGate>
    </AppShell>
  );
}
