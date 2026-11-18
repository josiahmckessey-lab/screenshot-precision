CREATE TABLE public.guide_messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 3000),
 reply_to text CHECK (char_length(reply_to) <= 200),
 included_question text CHECK (char_length(included_question) <= 2000)
);
GRANT INSERT ON public.guide_messages TO anon, authenticated;
GRANT ALL ON public.guide_messages TO service_role;
ALTER TABLE public.guide_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only submit guide messages" ON public.guide_messages FOR INSERT TO anon, authenticated WITH CHECK (char_length(body) BETWEEN 1 AND 3000 AND (reply_to IS NULL OR char_length(reply_to) <= 200) AND (included_question IS NULL OR char_length(included_question) <= 2000));
CREATE FUNCTION public.submit_guide_message(_body text, _reply_to text DEFAULT NULL, _included_question text DEFAULT NULL) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(791507);
 IF (SELECT count(*) FROM public.guide_messages WHERE created_at >= (date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')) >= 100 THEN RETURN NULL; END IF;
 INSERT INTO public.guide_messages(body, reply_to, included_question) VALUES (_body, _reply_to, _included_question) RETURNING id INTO new_id;
 RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.submit_guide_message(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_guide_message(text,text,text) TO anon, authenticated, service_role;