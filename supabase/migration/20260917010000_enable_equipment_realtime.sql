-- The public equipment pages subscribe to postgres_changes on
-- public.equipment so a price/stock edit in the admin dashboard shows up
-- immediately on the live site (previously only the enquiries/customers
-- tables were in the realtime publication).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'equipment'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.equipment;
  END IF;
END;
$$;
