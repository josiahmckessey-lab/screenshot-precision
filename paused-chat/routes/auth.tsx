import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";

import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { APP_NAME } from "@/lib/brand";
import { WelcomeStep } from "@/components/app/WelcomeStep";
import { AGE_ACCEPTED_KEY } from "@/lib/consent-text";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `Sign in — ${APP_NAME}` },
      { name: "description", content: `Get a secure sign-in link for ${APP_NAME} by email.` },
      { property: "og:title", content: `Sign in — ${APP_NAME}` },
      { property: "og:description", content: "Sign in with a link sent to your email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Please enter a valid email address.").max(255);

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [ageAccepted, setAgeAccepted] = useState(false);

  // Arriving from the email link (or already signed in): continue to the app.
  useEffect(() => {
    let active = true;
    setAgeAccepted(localStorage.getItem(AGE_ACCEPTED_KEY) === "true");
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) navigate({ to: "/consent", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/consent", replace: true });
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ageAccepted) return;
    setError(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please enter a valid email address.");
      return;
    }
    setStatus("sending");
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    if (sendError) {
      setStatus("idle");
      setError("We couldn't send your link just now. Please wait a moment and try again.");
      return;
    }
    setStatus("sent");
  }

  return (
    <AppShell>
      {!ageAccepted ? <WelcomeStep onContinue={() => setAgeAccepted(true)} /> : status === "sent" ? (
        <section className="fade-up flex flex-1 flex-col justify-center gap-6 py-10">
          <MailCheck className="size-10 text-primary" aria-hidden="true" />
          <h1 className="text-4xl">Check your email</h1>
          <p className="text-lg text-muted-foreground">
            We sent a sign-in link to <strong className="text-foreground">{email.trim()}</strong>.
            Open it on this device to continue.
          </p>
          <Button variant="quiet" size="xl" onClick={() => setStatus("idle")}>
            Use a different email
          </Button>
        </section>
      ) : (
        <form onSubmit={onSubmit} className="fade-up flex flex-1 flex-col justify-center gap-8 py-10">
          <div className="space-y-4">
            <h1 className="text-4xl">Sign in</h1>
            <p className="text-lg text-muted-foreground">
              Enter your email and we'll send you a link. No password needed.
            </p>
          </div>
          <div className="space-y-3">
            <Label htmlFor="email" className="text-lg">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-14 rounded-2xl bg-card px-5 text-lg md:text-lg"
              aria-invalid={error ? true : undefined}
            />
            {error && (
              <p role="alert" className="text-base text-destructive">
                {error}
              </p>
            )}
          </div>
          <Button type="submit" variant="calm" size="xl" disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Send my link"}
          </Button>
        </form>
      )}
    </AppShell>
  );
}
