ALTER TABLE public.profiles ADD COLUMN consent_reviewed_at timestamptz;
CREATE OR REPLACE FUNCTION public.record_profile_consent() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v text;
BEGIN
 IF NEW.consent_share AND NOT NEW.consent_save THEN
  IF TG_OP = 'UPDATE' AND OLD.consent_save AND NOT NEW.consent_save THEN NEW.consent_share := false;
  ELSE RAISE EXCEPTION 'Saving must be on before builder review'; END IF;
 END IF;
 IF TG_OP = 'INSERT' THEN
  IF NEW.consent_save OR NEW.consent_share THEN RAISE EXCEPTION 'Consent must start off'; END IF;
  RETURN NEW;
 END IF;
 IF NEW.consent_save IS DISTINCT FROM OLD.consent_save THEN
  SELECT value #>> '{}' INTO v FROM public.app_config WHERE key='text_version_consent_save';
  IF v IS NULL THEN RAISE EXCEPTION 'Missing consent text version'; END IF;
  INSERT INTO public.consent_log(user_id,consent_type,granted,text_version) VALUES(NEW.user_id,'save',NEW.consent_save,v);
 END IF;
 IF NEW.consent_share IS DISTINCT FROM OLD.consent_share THEN
  SELECT value #>> '{}' INTO v FROM public.app_config WHERE key='text_version_consent_share';
  IF v IS NULL THEN RAISE EXCEPTION 'Missing consent text version'; END IF;
  INSERT INTO public.consent_log(user_id,consent_type,granted,text_version) VALUES(NEW.user_id,'share',NEW.consent_share,v);
 END IF;
 IF OLD.age_confirmed_at IS NULL AND NEW.age_confirmed_at IS NOT NULL THEN
  SELECT value #>> '{}' INTO v FROM public.app_config WHERE key='text_version_age';
  INSERT INTO public.consent_log(user_id,consent_type,granted,text_version) VALUES(NEW.user_id,'age_18_plus',true,v);
 END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER record_profile_consent BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.record_profile_consent();
CREATE OR REPLACE FUNCTION public.change_consent(_type text, _granted boolean, _version text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.profiles; v text;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
 IF _type NOT IN ('save','share') THEN RAISE EXCEPTION 'Invalid choice'; END IF;
 SELECT * INTO p FROM public.profiles WHERE user_id=auth.uid() FOR UPDATE;
 IF p.age_confirmed_at IS NULL THEN RAISE EXCEPTION 'Confirm your age first'; END IF;
 SELECT value #>> '{}' INTO v FROM public.app_config WHERE key='text_version_consent_' || _type;
 IF v IS DISTINCT FROM _version THEN RAISE EXCEPTION 'Please reload to see the current consent text'; END IF;
 IF _type='share' AND _granted AND NOT p.consent_save THEN RAISE EXCEPTION 'Turn saving on first'; END IF;
 IF _type='save' THEN UPDATE public.profiles SET consent_save=_granted WHERE user_id=auth.uid();
 ELSE UPDATE public.profiles SET consent_share=_granted WHERE user_id=auth.uid(); END IF;
END; $$;
REVOKE ALL ON FUNCTION public.change_consent(text,boolean,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.change_consent(text,boolean,text) TO authenticated;
REVOKE UPDATE,DELETE ON public.consent_log FROM authenticated;
