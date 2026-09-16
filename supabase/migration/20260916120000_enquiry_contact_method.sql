-- Public enquiry form upgrade: capture how the visitor prefers to be
-- contacted, and auto-derive rental duration so it's always consistent
-- with start_date/end_date (never hand-set, never drifts).

ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS preferred_contact text
    CHECK (preferred_contact IS NULL OR preferred_contact IN ('whatsapp', 'email', 'phone'));

ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS duration_days integer
    GENERATED ALWAYS AS (
      CASE
        WHEN start_date IS NOT NULL AND end_date IS NOT NULL AND end_date >= start_date
          THEN (end_date - start_date)
        ELSE NULL
      END
    ) STORED;
