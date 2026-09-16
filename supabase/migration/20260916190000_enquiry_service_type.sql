-- The public enquiry form now covers every service line (not just
-- equipment rental/purchase), so enquiries need to record which one the
-- visitor selected. Kept separate from transaction_type, which stays
-- specifically about equipment rental vs purchase.
ALTER TABLE public.enquiries
  ADD COLUMN IF NOT EXISTS service_type text NOT NULL DEFAULT 'equipment_rental'
    CHECK (service_type IN (
      'equipment_rental',
      'equipment_purchase',
      'energy_petroleum',
      'general_trading',
      'import_export',
      'logistics',
      'construction',
      'management_consultancy'
    ));

CREATE INDEX IF NOT EXISTS enquiries_service_type_idx ON public.enquiries(service_type);
