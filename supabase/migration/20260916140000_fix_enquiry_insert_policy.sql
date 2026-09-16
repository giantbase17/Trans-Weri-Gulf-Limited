-- The public enquiry form is failing with "new row violates row-level
-- security policy for table enquiries" for anonymous visitors — even a
-- bare-minimum insert is rejected, so the anon INSERT policy isn't in
-- effect. Re-create it explicitly (idempotent either way).

DROP POLICY IF EXISTS "enquiries_public_insert" ON public.enquiries;
CREATE POLICY "enquiries_public_insert" ON public.enquiries
FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "enquiries_auth_insert" ON public.enquiries;
CREATE POLICY "enquiries_auth_insert" ON public.enquiries
FOR INSERT TO authenticated WITH CHECK (true);

-- Make sure RLS is actually enabled (a no-op if it already is).
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
