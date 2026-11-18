-- One row per day counting topic-sorter runs. Service-role only: RLS on with no policies.
CREATE TABLE public.match_calls (
  day date PRIMARY KEY,
  calls integer NOT NULL DEFAULT 0
);

GRANT ALL ON public.match_calls TO service_role;

ALTER TABLE public.match_calls ENABLE ROW LEVEL SECURITY;

-- Adds one to today's count and returns the new total. Server-only: no visitor role may call it.
CREATE OR REPLACE FUNCTION public.record_match_call()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE n integer;
BEGIN
  INSERT INTO public.match_calls (day, calls)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (day) DO UPDATE SET calls = public.match_calls.calls + 1
  RETURNING calls INTO n;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.record_match_call() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_match_call() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_match_call() TO service_role;

-- Editable settings: daily cap for the sorter and the model it uses.
INSERT INTO public.app_config (key, value)
SELECT 'match_topic_daily_cap', '300'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.app_config WHERE key = 'match_topic_daily_cap');

INSERT INTO public.app_config (key, value)
SELECT 'model_match_topics', '"claude-haiku-5-5"'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.app_config WHERE key = 'model_match_topics');