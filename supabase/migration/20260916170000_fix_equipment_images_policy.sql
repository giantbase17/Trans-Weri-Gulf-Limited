-- Uploading an equipment photo fails with "new row violates row-level
-- security policy". The equipment-photos storage bucket itself turned out
-- to have never been created until a recent migration fixed that — its
-- RLS policies come from that same old migration file, so they may never
-- have actually been applied either. Re-create everything explicitly
-- (idempotent either way) for both the metadata table and the bucket.

DROP POLICY IF EXISTS "eqimg_public_read" ON public.equipment_images;
CREATE POLICY "eqimg_public_read" ON public.equipment_images
FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "eqimg_auth_read" ON public.equipment_images;
CREATE POLICY "eqimg_auth_read" ON public.equipment_images
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "eqimg_staff_write" ON public.equipment_images;
CREATE POLICY "eqimg_staff_write" ON public.equipment_images
FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

ALTER TABLE public.equipment_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eqphotos_staff_read" ON storage.objects;
CREATE POLICY "eqphotos_staff_read" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'equipment-photos' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "eqphotos_staff_insert" ON storage.objects;
CREATE POLICY "eqphotos_staff_insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'equipment-photos' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "eqphotos_staff_update" ON storage.objects;
CREATE POLICY "eqphotos_staff_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'equipment-photos' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "eqphotos_staff_delete" ON storage.objects;
CREATE POLICY "eqphotos_staff_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'equipment-photos' AND public.is_staff(auth.uid()));
