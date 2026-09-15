-- Add multi-currency support for equipment pricing
ALTER TABLE public.equipment 
ADD COLUMN daily_rate_usd numeric(12,2),
ADD COLUMN weekly_rate_usd numeric(12,2),
ADD COLUMN monthly_rate_usd numeric(12,2),
ADD COLUMN sale_price_usd numeric(12,2);

-- Create transaction type enum (must exist before it is used as a column type below)
CREATE TYPE public.transaction_type AS ENUM ('rental', 'purchase', 'both');

-- Add quantity and transaction type to enquiries
ALTER TABLE public.enquiries
ADD COLUMN quantity integer DEFAULT 1,
ADD COLUMN transaction_type public.transaction_type DEFAULT 'rental',
ADD COLUMN outcome text,
ADD COLUMN unit_price numeric(12,2),
ADD COLUMN total_value numeric(12,2),
ADD COLUMN currency text DEFAULT 'NGN';

-- Update existing data with estimated USD prices (assuming 1 USD = 1500 NGN)
UPDATE public.equipment 
SET 
  daily_rate_usd = CASE WHEN daily_rate IS NOT NULL THEN daily_rate / 1500 ELSE NULL END,
  weekly_rate_usd = CASE WHEN weekly_rate IS NOT NULL THEN weekly_rate / 1500 ELSE NULL END,
  monthly_rate_usd = CASE WHEN monthly_rate IS NOT NULL THEN monthly_rate / 1500 ELSE NULL END,
  sale_price_usd = CASE WHEN sale_price IS NOT NULL THEN sale_price / 1500 ELSE NULL END
WHERE daily_rate_usd IS NULL;

-- Add index for better enquiry performance
CREATE INDEX IF NOT EXISTS enquiries_transaction_type_idx ON public.enquiries(transaction_type);
CREATE INDEX IF NOT EXISTS enquiries_quantity_idx ON public.enquiries(quantity);