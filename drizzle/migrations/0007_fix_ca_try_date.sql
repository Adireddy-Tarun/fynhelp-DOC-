CREATE OR REPLACE FUNCTION public._ca_try_date(p text) RETURNS date
LANGUAGE plpgsql IMMUTABLE SET search_path = public AS $$
DECLARE s text := btrim(coalesce(p,'')); d date;
BEGIN
  IF s !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN RETURN NULL; END IF;
  d := s::date;
  IF to_char(d, 'YYYY-MM-DD') <> s THEN RETURN NULL; END IF;
  RETURN d;
EXCEPTION WHEN others THEN RETURN NULL;
END $$;