import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProfileSettings = { story_on: boolean; verse_on: boolean };

export type MyProfile = {
  user_id: string;
  age_confirmed_at: string | null;
  consent_save: boolean;
  consent_share: boolean;
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
      .select("user_id, age_confirmed_at, consent_save, consent_share, settings")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error("We couldn't load your settings. Please try again.");
    if (data) return { ...data, settings: normalizeSettings(data.settings) };

    // Safety net if the signup trigger did not run: create with private defaults.
    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert({ user_id: userId })
      .select("user_id, age_confirmed_at, consent_save, consent_share, settings")
      .single();
    if (insertError || !created) throw new Error("We couldn't set up your space. Please try again.");
    return { ...created, settings: normalizeSettings(created.settings) };
  });

export const confirmAge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const textVersion = await readTextVersion("text_version_age");
    const { error } = await supabase
      .from("profiles")
      .update({ age_confirmed_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (error) throw new Error("We couldn't save that. Please try again.");
    await supabase.from("consent_log").insert({
      user_id: userId,
      consent_type: "age_18_plus",
      granted: true,
      text_version: textVersion,
    });
    return { ok: true };
  });

export const setConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ type: z.enum(["save", "share"]), granted: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const textVersion = await readTextVersion(`text_version_consent_${data.type}`);
    const patch = data.type === "save" ? { consent_save: data.granted } : { consent_share: data.granted };
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", userId);
    if (error) throw new Error("We couldn't save that choice. Please try again.");
    const { error: logError } = await supabase.from("consent_log").insert({
      user_id: userId,
      consent_type: data.type,
      granted: data.granted,
      text_version: textVersion,
    });
    if (logError) throw new Error("We couldn't record that choice. Please try again.");
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
