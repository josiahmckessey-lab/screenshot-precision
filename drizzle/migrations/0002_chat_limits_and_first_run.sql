ALTER TABLE public.profiles ADD COLUMN privacy_notice_version text;
ALTER TABLE public.profiles ADD COLUMN verse_offered_at timestamptz;
CREATE TABLE public.chat_reservations (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, day date NOT NULL, reserved_tokens integer NOT NULL, completed boolean NOT NULL DEFAULT false);
GRANT ALL ON public.chat_reservations TO service_role;
REVOKE ALL ON public.chat_reservations FROM anon,authenticated;
ALTER TABLE public.chat_reservations ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.ai_access_state (key text PRIMARY KEY, message text NOT NULL, status integer NOT NULL);
GRANT ALL ON public.ai_access_state TO service_role;
REVOKE ALL ON public.ai_access_state FROM anon,authenticated;
ALTER TABLE public.ai_access_state ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.reserve_chat(_user uuid,_budget integer) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE d date := (now() AT TIME ZONE 'utc')::date; r integer; t integer; gr bigint; gt bigint; rc integer; tc integer; gc integer; gtc integer; result uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(7142026);
 IF _budget <= 0 THEN RAISE EXCEPTION 'Invalid budget'; END IF;
 SELECT (value #>> '{}')::integer INTO rc FROM public.app_config WHERE key='daily_request_cap';
 SELECT (value #>> '{}')::integer INTO tc FROM public.app_config WHERE key='daily_token_cap';
 SELECT (value #>> '{}')::integer INTO gc FROM public.app_config WHERE key='global_daily_request_cap';
 SELECT (value #>> '{}')::integer INTO gtc FROM public.app_config WHERE key='global_daily_token_cap';
 IF rc IS NULL OR tc IS NULL OR gc IS NULL OR gtc IS NULL THEN RAISE EXCEPTION 'Missing limits'; END IF;
 INSERT INTO public.spend_ledger(user_id,day) VALUES(_user,d) ON CONFLICT DO NOTHING;
 SELECT requests,tokens INTO r,t FROM public.spend_ledger WHERE user_id=_user AND day=d;
 SELECT COALESCE(sum(requests),0),COALESCE(sum(tokens),0) INTO gr,gt FROM public.spend_ledger WHERE day=d;
 IF r>=rc OR t+_budget>tc OR gr>=gc OR gt+_budget>gtc THEN RETURN NULL; END IF;
 UPDATE public.spend_ledger SET requests=requests+1,tokens=tokens+_budget WHERE user_id=_user AND day=d;
 INSERT INTO public.chat_reservations(user_id,day,reserved_tokens) VALUES(_user,d,_budget) RETURNING id INTO result;
 RETURN result;
END; $$;
CREATE OR REPLACE FUNCTION public.settle_chat(_id uuid,_tokens integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE r public.chat_reservations;
BEGIN
 PERFORM pg_advisory_xact_lock(7142026);
 SELECT * INTO r FROM public.chat_reservations WHERE id=_id FOR UPDATE;
 IF r.id IS NULL OR r.completed THEN RETURN; END IF;
 UPDATE public.spend_ledger SET tokens=greatest(0,tokens-r.reserved_tokens+greatest(0,_tokens)) WHERE user_id=r.user_id AND day=r.day;
 UPDATE public.chat_reservations SET completed=true WHERE id=_id;
END; $$;
REVOKE ALL ON FUNCTION public.reserve_chat(uuid,integer),public.settle_chat(uuid,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_chat(uuid,integer),public.settle_chat(uuid,integer) TO service_role;
CREATE OR REPLACE FUNCTION public.save_chat_exchange(_conversation uuid,_message text,_reply text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE p public.profiles; cid uuid;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 SELECT * INTO p FROM public.profiles WHERE user_id=auth.uid() FOR UPDATE;
 IF NOT p.consent_save OR p.age_confirmed_at IS NULL THEN RETURN NULL; END IF;
 IF _conversation IS NULL THEN INSERT INTO public.conversations(user_id) VALUES(auth.uid()) RETURNING id INTO cid;
 ELSE SELECT id INTO cid FROM public.conversations WHERE id=_conversation AND user_id=auth.uid();
 IF cid IS NULL THEN RAISE EXCEPTION 'Conversation unavailable'; END IF; END IF;
 INSERT INTO public.messages(conversation_id,user_id,role,content) VALUES(cid,auth.uid(),'user',_message),(cid,auth.uid(),'assistant',_reply);
 RETURN cid;
END; $$;
REVOKE ALL ON FUNCTION public.save_chat_exchange(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.save_chat_exchange(uuid,text,text) TO service_role;
