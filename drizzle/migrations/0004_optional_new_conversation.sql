CREATE OR REPLACE FUNCTION public.save_chat_exchange(_conversation uuid DEFAULT NULL,_message text DEFAULT '',_reply text DEFAULT '') RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
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