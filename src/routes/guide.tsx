import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  APP_NAME,
  GUIDE_CONTACT_LABEL,
  GUIDE_CRISIS_TEXT,
  GUIDE_EMAIL,
  GUIDE_EMAIL_HREF,
  GUIDE_HOURS,
  GUIDE_INTRO,
  GUIDE_NAME,
  GUIDE_PHONE,
  GUIDE_PHONE_HREF,
  GUIDE_TEXT,
  GUIDE_TITLE,
  GUIDE_MESSAGE_LABEL,
  MESSAGE_GUIDE,
} from "@/lib/brand";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: `${GUIDE_TITLE} — ${APP_NAME}` },
      { name: "description", content: GUIDE_TEXT },
      { property: "og:title", content: `${GUIDE_TITLE} — ${APP_NAME}` },
      { property: "og:description", content: GUIDE_TEXT },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  const [message, setMessage] = useState("");
  return (
    <AppShell>
      <div className="space-y-6 py-6">
        <Link to="/" className="text-base underline underline-offset-4">← Back to home</Link>
        <h1 className="text-4xl leading-tight sm:text-5xl">{GUIDE_TITLE}</h1>
        <p className="text-lg leading-relaxed">{GUIDE_INTRO}</p>

        <section className="space-y-3 rounded-2xl border bg-card p-5 text-card-foreground">
          <h2 className="text-lg leading-relaxed">{GUIDE_CONTACT_LABEL}</h2>
          <p className="text-lg font-semibold">{GUIDE_NAME}</p>
          <p className="text-lg">
            <a className="underline underline-offset-4" href={GUIDE_PHONE_HREF}>
              {GUIDE_PHONE}
            </a>
          </p>
          <p className="text-lg">
            <a className="underline underline-offset-4" href={GUIDE_EMAIL_HREF}>
              {GUIDE_EMAIL}
            </a>
          </p>
          <p className="text-lg text-muted-foreground">{GUIDE_HOURS}</p>
        </section>

        <section id="message-box" className="scroll-mt-6 space-y-3">
          <h2 className="text-2xl">{MESSAGE_GUIDE}</h2>
          <Textarea aria-label={GUIDE_MESSAGE_LABEL} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button asChild><a href={`${GUIDE_EMAIL_HREF}?body=${encodeURIComponent(message)}`}>{MESSAGE_GUIDE}</a></Button>
        </section>

        <p className="border-l-4 border-clay bg-clay-soft p-5 text-lg leading-relaxed">
          {GUIDE_CRISIS_TEXT}
        </p>
      </div>
    </AppShell>
  );
}
