-- Aligns the live site_settings address with the address stated in the
-- official corporate profile (Road 101, Ekeki Housing Estate), replacing
-- the Okaka Estate address that was previously entered.
UPDATE public.site_settings
SET address = 'Road 101, Block B, Flat 3, Ekeki Housing Estate Phase 2, Yenagoa, Bayelsa State, Nigeria'
WHERE id = true;
