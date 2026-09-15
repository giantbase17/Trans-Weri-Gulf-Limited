CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(requested_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> requested_user_id THEN
    RAISE EXCEPTION 'Only the authenticated user can claim an administrator account';
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles) THEN
    RETURN false;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (requested_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_first_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(uuid) TO authenticated;