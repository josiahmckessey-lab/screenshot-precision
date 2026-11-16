import { createFileRoute, redirect } from "@tanstack/react-router";

import { AgeGate } from "@/components/app/AgeGate";
import { ChatScreen } from "@/components/app/ChatScreen";
import { APP_NAME } from "@/lib/brand";
import { profileQuery } from "@/lib/profile-query";
import { CONSENT_VERSION } from "@/lib/consent-text";

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
    if (!profile.consent_reviewed_at || profile.privacy_notice_version !== CONSENT_VERSION)
      throw redirect({ to: "/consent" });
    if (!profile.verse_offered_at) throw redirect({ to: "/verse-choice" });
    return profile;
  },
  component: HomePage,
});

function HomePage() {
  return (
    <AgeGate>
      <ChatScreen />
    </AgeGate>
  );
}
