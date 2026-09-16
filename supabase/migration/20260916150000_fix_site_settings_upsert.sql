-- Saving site information (company info + logo) fails with "Could not
-- update site information" because saveSiteSettings() uses .upsert(),
-- which Postgres treats as an INSERT ... ON CONFLICT DO UPDATE statement.
-- site_settings only had a SELECT and an UPDATE policy — no INSERT policy
-- — so RLS rejects the statement outright before it ever gets to decide
-- whether it's actually inserting or updating.

CREATE POLICY "site_settings_staff_insert" ON public.site_settings
FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
