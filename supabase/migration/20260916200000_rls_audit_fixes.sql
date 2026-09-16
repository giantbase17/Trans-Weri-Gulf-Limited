-- Systematic RLS audit after finding the same "missing policy on an old,
-- possibly-never-applied migration" bug three times this session
-- (enquiries insert, site_settings insert, equipment-photos storage).
-- This re-asserts every policy on the two tables most likely to share that
-- history, and fills the one genuine gap found: site-assets storage never
-- had a DELETE policy at all.
--
-- Every other table was checked against what the app actually does
-- (profiles, user_roles, equipment, equipment_images, equipment_categories,
-- customers, enquiries, site_posts) and already has full coverage for
-- every command the app issues.

DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read" ON public.site_settings
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "site_settings_staff_write" ON public.site_settings;
CREATE POLICY "site_settings_staff_write" ON public.site_settings
FOR UPDATE TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "site_assets_staff_read" ON storage.objects;
CREATE POLICY "site_assets_staff_read" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'site-assets' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "site_assets_staff_write" ON storage.objects;
CREATE POLICY "site_assets_staff_write" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'site-assets' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "site_assets_staff_update" ON storage.objects;
CREATE POLICY "site_assets_staff_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'site-assets' AND public.is_staff(auth.uid()))
WITH CHECK (bucket_id = 'site-assets' AND public.is_staff(auth.uid()));

-- This one was missing entirely, not just unapplied.
DROP POLICY IF EXISTS "site_assets_staff_delete" ON storage.objects;
CREATE POLICY "site_assets_staff_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'site-assets' AND public.is_staff(auth.uid()));
