-- ========== app_config (server only) ==========
CREATE TABLE public.app_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON public.app_config FROM anon, authenticated;
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_config (key, value) VALUES
  ('daily_request_cap', '30'::jsonb),
  ('daily_token_cap', '60000'::jsonb),
  ('model_reply', '"openai/gpt-6-astra"'::jsonb),
  ('model_crisis_check', '"openai/gpt-6-astra"'::jsonb),
  ('verse_on_default', 'false'::jsonb),
  ('text_version_age', '"v1"'::jsonb),
  ('text_version_consent_save', '"v1"'::jsonb),
  ('text_version_consent_share', '"v1"'::jsonb),
  ('text_version_welcome', '"v1"'::jsonb);

-- ========== profiles ==========
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  age_confirmed_at timestamptz,
  consent_save boolean NOT NULL DEFAULT false,
  consent_share boolean NOT NULL DEFAULT false,
  settings jsonb NOT NULL DEFAULT '{"story_on": true, "verse_on": false}'::jsonb
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own profile delete" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create profile on signup, with verse_on default from app_config
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  verse_default boolean;
BEGIN
  SELECT COALESCE((value)::text::boolean, false) INTO verse_default
  FROM public.app_config WHERE key = 'verse_on_default';
  INSERT INTO public.profiles (user_id, settings)
  VALUES (NEW.id, jsonb_build_object('story_on', true, 'verse_on', COALESCE(verse_default, false)))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: has this user turned saving on?
CREATE OR REPLACE FUNCTION public.can_save(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT consent_save FROM public.profiles WHERE user_id = _user_id), false)
$$;
REVOKE EXECUTE ON FUNCTION public.can_save(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_save(uuid) TO authenticated, service_role;

-- ========== conversations ==========
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX conversations_user_idx ON public.conversations(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own conversations select" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own conversations insert when saving on" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.can_save(auth.uid()));
CREATE POLICY "Own conversations update" ON public.conversations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own conversations delete" ON public.conversations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========== messages ==========
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_idx ON public.messages(conversation_id, created_at);
CREATE INDEX messages_user_idx ON public.messages(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own messages select" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own messages insert when saving on" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND public.can_save(auth.uid())
    AND EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid())
  );
CREATE POLICY "Own messages update" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own messages delete" ON public.messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========== consent_log ==========
CREATE TABLE public.consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  consent_type text NOT NULL,
  granted boolean NOT NULL,
  text_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX consent_log_user_idx ON public.consent_log(user_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consent_log TO authenticated;
GRANT ALL ON public.consent_log TO service_role;
ALTER TABLE public.consent_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own consent select" ON public.consent_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own consent insert" ON public.consent_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own consent update" ON public.consent_log FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own consent delete" ON public.consent_log FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========== crisis_events (no message text, ever) ==========
CREATE TABLE public.crisis_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL
);
CREATE INDEX crisis_events_user_idx ON public.crisis_events(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crisis_events TO authenticated;
GRANT ALL ON public.crisis_events TO service_role;
ALTER TABLE public.crisis_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own crisis select" ON public.crisis_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own crisis insert" ON public.crisis_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own crisis update" ON public.crisis_events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own crisis delete" ON public.crisis_events FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========== spend_ledger (server only) ==========
CREATE TABLE public.spend_ledger (
  user_id uuid NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  requests integer NOT NULL DEFAULT 0,
  tokens integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
REVOKE ALL ON public.spend_ledger FROM anon, authenticated;
GRANT ALL ON public.spend_ledger TO service_role;
ALTER TABLE public.spend_ledger ENABLE ROW LEVEL SECURITY;

-- ========== brain_chunks (server only, no user policies at all) ==========
CREATE TABLE public.brain_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('core', 'index', 'entry', 'story')),
  entry_number integer,
  title text NOT NULL,
  body text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}'
);
CREATE INDEX brain_chunks_kind_idx ON public.brain_chunks(kind);
CREATE INDEX brain_chunks_tags_idx ON public.brain_chunks USING gin(tags);
REVOKE ALL ON public.brain_chunks FROM anon, authenticated;
GRANT ALL ON public.brain_chunks TO service_role;
ALTER TABLE public.brain_chunks ENABLE ROW LEVEL SECURITY;

INSERT INTO public.brain_chunks (kind, entry_number, title, body, tags) VALUES
  ('core', NULL, 'Placeholder core', 'PLACEHOLDER: core voice and principles. Replace with the real library import.', ARRAY['placeholder','core']),
  ('entry', 1, 'Placeholder entry: a hard day', 'PLACEHOLDER: entry about feeling overwhelmed. Replace with the real library import.', ARRAY['placeholder','overwhelm','stress']),
  ('story', 1, 'Placeholder story', 'PLACEHOLDER: a short story to accompany a reply. Replace with the real library import.', ARRAY['placeholder','story']);