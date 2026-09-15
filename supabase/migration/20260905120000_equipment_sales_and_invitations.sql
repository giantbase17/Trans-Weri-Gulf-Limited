-- Add sales capability to equipment
ALTER TABLE public.equipment 
ADD COLUMN for_rent boolean NOT NULL DEFAULT true,
ADD COLUMN for_sale boolean NOT NULL DEFAULT false,
ADD COLUMN sale_price numeric(12,2),
ADD COLUMN sale_currency text NOT NULL DEFAULT 'NGN';

-- Add email invitation tracking
CREATE TABLE public.user_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  invitation_email text NOT NULL,
  invitation_password text NOT NULL, -- Temporarily store for sending
  invitation_sent_at timestamptz,
  invitation_accepted_at timestamptz,
  password_changed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_invitations TO authenticated;
GRANT ALL ON public.user_invitations TO service_role;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations_admin_all" ON public.user_invitations FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "invitations_staff_read" ON public.user_invitations FOR SELECT TO authenticated 
USING (public.is_staff(auth.uid()));

-- Create enquiry type enum (must exist before it is used as a column type below)
CREATE TYPE public.enquiry_type AS ENUM ('rental', 'sale', 'both');

-- Add email tracking for equipment inquiries
ALTER TABLE public.enquiries
ADD COLUMN inquiry_type public.enquiry_type DEFAULT 'rental',
ADD COLUMN budget_range text;

-- Update existing equipment to have both rental and sales enabled by default
UPDATE public.equipment 
SET for_sale = true, sale_price = daily_rate * 30 * 12 -- Estimate sale price as 1 year of rental
WHERE for_sale = false;

-- Add function to send user invitation email
CREATE OR REPLACE FUNCTION public.send_user_invitation(
  target_user_id uuid,
  target_email text,
  temp_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inviter_email text;
  inviter_name text;
BEGIN
  -- Check if the caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can send invitations';
  END IF;

  -- Get inviter details
  SELECT email, full_name INTO inviter_email, inviter_name
  FROM public.profiles WHERE id = auth.uid();

  -- Insert invitation record
  INSERT INTO public.user_invitations (
    user_id, 
    invited_by, 
    invitation_email, 
    invitation_password,
    invitation_sent_at
  ) VALUES (
    target_user_id, 
    auth.uid(), 
    target_email, 
    temp_password,
    now()
  );

  -- Note: Actual email sending requires integration with email service
  -- This function stores the invitation details for the email service to process
  -- In production, you would integrate with Resend, SendGrid, or Supabase Email
  -- The email template would be:
  -- Subject: Welcome to Trans Weri Gulf - Your Account Details
  -- Body: 
  -- Dear [User Name],
  -- 
  -- Your account has been created by [Inviter Name] at Trans Weri Gulf Limited.
  -- 
  -- Login Details:
  -- Email: [target_email]
  -- Temporary Password: [temp_password]
  -- 
  -- IMPORTANT: Please log in and change your password immediately for security.
  -- 
  -- You can access the system at: [your-app-url]
  -- 
  -- If you have any questions, please contact us.
  -- 
  -- Best regards,
  -- Trans Weri Gulf Team
  
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.send_user_invitation(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_user_invitation(uuid, text, text) TO authenticated;