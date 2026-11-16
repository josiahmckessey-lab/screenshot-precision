import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { AgeGate } from "@/components/app/AgeGate";
import { ConsentChoices } from "@/components/app/ConsentChoices";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { updateSettings, type MyProfile } from "@/lib/account.functions";
import { APP_NAME } from "@/lib/brand";
import { profileQuery } from "@/lib/profile-query";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: `Your settings — ${APP_NAME}` },
      { name: "description", content: "Choose what is saved and how replies look." },
      { property: "og:title", content: `Your settings — ${APP_NAME}` },
      { property: "og:description", content: "Saving and sharing stay off until you turn them on." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: SettingsPage,
});

function BackLink() {
  return (
    <Button asChild variant="ghost" className="h-11 rounded-full px-4 text-base">
      <Link to="/home">
        <ArrowLeft className="size-5" /> Back
      </Link>
    </Button>
  );
}

function ToggleRow({
  id,
  title,
  body,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  title: string;
  body: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-5 py-5">
      <div className="space-y-1">
        <label htmlFor={id} className="text-lg font-semibold">
          {title}
        </label>
        <p className="text-base text-muted-foreground">{body}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        className="mt-1 scale-125"
      />
    </div>
  );
}

function SettingsPage() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const settingsFn = useServerFn(updateSettings);

  const patchCache = (patch: Partial<MyProfile>) =>
    queryClient.setQueryData<MyProfile>(profileQuery.queryKey, (old) => (old ? { ...old, ...patch } : old));
  const onError = (e: Error) => {
    toast.error(e.message);
    queryClient.invalidateQueries({ queryKey: profileQuery.queryKey });
  };

  const settings = useMutation({
    mutationFn: (v: MyProfile["settings"]) => settingsFn({ data: v }),
    onMutate: (v) => patchCache({ settings: v }),
    onError,
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <AppShell nav={<BackLink />}>
      <AgeGate>
        <section className="fade-up flex flex-col gap-10 py-6">
          <h1 className="text-4xl">Your settings</h1>

          <div>
            <h2 className="text-2xl">Privacy</h2>
            <ConsentChoices />
          </div>

          <div>
            <h2 className="text-2xl">Replies</h2>
            <div className="divide-y divide-border">
              <ToggleRow
                id="story-on"
                title="Include a short story"
                body="Some replies can include a brief story."
                checked={profile.settings.story_on}
                disabled={settings.isPending}
                onChange={(story_on) => settings.mutate({ ...profile.settings, story_on })}
              />
              <ToggleRow
                id="verse-on"
                title="Include a verse"
                body="Some replies can include a short verse."
                checked={profile.settings.verse_on}
                disabled={settings.isPending}
                onChange={(verse_on) => settings.mutate({ ...profile.settings, verse_on })}
              />
            </div>
          </div>

          <Button variant="quiet" size="xl" onClick={signOut}>
            Sign out
          </Button>
        </section>
      </AgeGate>
    </AppShell>
  );
}
