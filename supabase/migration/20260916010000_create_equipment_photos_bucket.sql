-- The "equipment-photos" bucket has RLS policies (from
-- 20260901175530_...) referencing it, but the bucket itself was never
-- created, so every equipment photo upload has been failing with
-- "Bucket not found". Create it now.
INSERT INTO storage.buckets (id, name, public)
VALUES ('equipment-photos', 'equipment-photos', false)
ON CONFLICT (id) DO NOTHING;
