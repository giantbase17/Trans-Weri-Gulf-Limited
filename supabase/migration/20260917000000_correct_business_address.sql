-- Corrects the business address — the previous Ekeki Housing Estate address
-- (20260916180000_update_business_address.sql) was a mistake; this is the
-- correct registered address.
UPDATE public.site_settings
SET address = 'No. 3 Okaka Estate, Yenagoa, Nigeria, 560211'
WHERE id = true;
