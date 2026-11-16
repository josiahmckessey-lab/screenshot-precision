import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Switch } from "@/components/ui/switch";
import { setConsent } from "@/lib/account.functions";
import { CONSENT_TEXT, CONSENT_VERSION } from "@/lib/consent-text";
import { profileQuery } from "@/lib/profile-query";
import { nextConsent } from "@/lib/consent-rules";
import { PROVIDER_NOTICE } from "@/lib/brand";

export function ConsentChoices({ onBusyChange }: { onBusyChange?: (busy: boolean) => void }) {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const queryClient = useQueryClient();
  const consentFn = useServerFn(setConsent);
  const mutation = useMutation({
    mutationFn: (v: { type: "save" | "share"; granted: boolean }) => consentFn({ data: { ...v, version: CONSENT_VERSION } }),
    onMutate: () => onBusyChange?.(true),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQuery.queryKey });
      onBusyChange?.(false);
    },
  });
  return (
    <div>
      <p className="text-base text-muted-foreground">{PROVIDER_NOTICE}</p>
      <div className="divide-y divide-border">
        {(["save", "share"] as const).map(type => (
          <div key={type} className="flex items-start justify-between gap-5 py-5">
            <div className="space-y-2">
              <label htmlFor={`consent-${type}`} className="text-lg font-semibold">{CONSENT_TEXT[type].title}</label>
              <p id={`consent-${type}-description`} className="text-base text-muted-foreground">{CONSENT_TEXT[type].body}</p>
            </div>
            <Switch id={`consent-${type}`} className="mt-1 shrink-0" aria-describedby={`consent-${type}-description`}
              checked={type === "save" ? profile.consent_save : profile.consent_share}
              disabled={mutation.isPending || (type === "share" && !profile.consent_save)}
              onCheckedChange={granted => {
                const next = nextConsent(profile, type, granted);
                mutation.mutate({ type, granted: type === "save" ? next.consent_save : next.consent_share });
              }} />
          </div>
        ))}
      </div>
      {mutation.error && <p role="alert" className="text-base text-destructive">{mutation.error.message}</p>}
    </div>
  );
}