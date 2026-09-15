CREATE OR REPLACE FUNCTION public.create_customer_from_enquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched_customer_id uuid;
BEGIN
  IF NEW.email IS NOT NULL AND length(trim(NEW.email)) > 0 THEN
    SELECT id INTO matched_customer_id
    FROM public.customers
    WHERE lower(email) = lower(trim(NEW.email))
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF matched_customer_id IS NULL AND NEW.phone IS NOT NULL THEN
    SELECT id INTO matched_customer_id
    FROM public.customers
    WHERE regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace(NEW.phone, '[^0-9]', '', 'g')
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF matched_customer_id IS NULL THEN
    INSERT INTO public.customers (full_name, company, email, phone)
    VALUES (NEW.full_name, NEW.company, NULLIF(trim(NEW.email), ''), NEW.phone)
    RETURNING id INTO matched_customer_id;
  ELSE
    UPDATE public.customers
    SET full_name = COALESCE(NULLIF(trim(NEW.full_name), ''), full_name),
        company = COALESCE(NULLIF(trim(NEW.company), ''), company),
        email = COALESCE(NULLIF(trim(NEW.email), ''), email),
        phone = COALESCE(NULLIF(trim(NEW.phone), ''), phone)
    WHERE id = matched_customer_id;
  END IF;

  NEW.customer_id = matched_customer_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS t_create_customer_from_enquiry ON public.enquiries;
CREATE TRIGGER t_create_customer_from_enquiry
BEFORE INSERT ON public.enquiries
FOR EACH ROW EXECUTE FUNCTION public.create_customer_from_enquiry();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'enquiries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'customers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
  END IF;
END;
$$;