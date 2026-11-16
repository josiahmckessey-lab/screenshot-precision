import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AppShell } from "@/components/app/AppShell";
import { WelcomeStep } from "@/components/app/WelcomeStep";
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
  const navigate = useNavigate();
  return (
    <AppShell>
      <WelcomeStep onContinue={() => navigate({ to: "/auth" })} />
    </AppShell>
  );
}
