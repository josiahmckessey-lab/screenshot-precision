import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CONSENT_VERSION } from "@/lib/consent-text";

export type ProfileSettings = { story_on: boolean; verse_on: boolean };

export type MyProfile = {
  user_id: string;
  age_confirmed_at: string | null;
  consent_save: boolean;
  consent_share: boolean;
  consent_reviewed_at: string | null;
  settings: ProfileSettings;
};

// app_config is server-only (no user policies), so read it with the service role
// inside the handler, after the caller is authenticated.
async function readTextVersion(key: string): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("app_config").select("value").eq("key", key).maybeSingle();
  return typeof data?.value === "string" ? data.value : "v1";
}

function normalizeSettings(raw: unknown): ProfileSettings {
  const s = (raw ?? {}) as Partial<ProfileSettings>;
  return { story_on: s.story_on !== false, verse_on: s.verse_on === true };
}

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyProfile> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, age_confirmed_at, consent_save, consent_share, consent_reviewed_at, settings")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error("We couldn't load your settings. Please try again.");
    if (data) return { ...data, settings: normalizeSettings(data.settings) };

    // Safety net if the signup trigger did not run: create with private defaults.
    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({ user_id: userId })
      .select("user_id, age_confirmed_at, consent_save, consent_share, consent_reviewed_at, settings")
      .single();
    if (insertError || !created) throw new Error("We couldn't set up your space. Please try again.");
    return { ...created, settings: normalizeSettings(created.settings) };
  });

export const confirmAge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ confirmed: z.literal(true) }).parse(input))
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    if (await readTextVersion("text_version_age") !== CONSENT_VERSION) throw new Error("Please reload to see the current age notice.");
    const { error } = await supabase
      .from("profiles")
      .update({ age_confirmed_at: new Date().toISOString() })
      .eq("user_id", userId).is("age_confirmed_at", null);
    if (error) throw new Error("We couldn't save that. Please try again.");
    return { ok: true };
  });

export const setConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ type: z.enum(["save", "share"]), granted: z.boolean(), version: z.string() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.rpc("change_consent", { _type: data.type, _granted: data.granted, _version: data.version });
    if (error) throw new Error("We couldn't save that choice. Please try again.");
    return { ok: true };
  });

export const finishConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error, data } = await context.supabase.from("profiles")
      .update({ consent_reviewed_at: new Date().toISOString() })
      .eq("user_id", context.userId).not("age_confirmed_at", "is", null).select("user_id").single();
    if (error || !data) throw new Error("We couldn't save your choices. Please try again.");
    return { ok: true };
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ story_on: z.boolean(), verse_on: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update({ settings: data }).eq("user_id", userId);
    if (error) throw new Error("We couldn't save your settings. Please try again.");
    return { ok: true };
  });
