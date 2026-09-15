-- Function to create a new user and assign role (admin only)
CREATE OR REPLACE FUNCTION public.admin_create_user(
  new_email text,
  new_password text,
  new_full_name text DEFAULT NULL,
  new_phone text DEFAULT NULL,
  new_role public.app_role DEFAULT 'staff'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Check if the caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  -- Create the user in auth.users
  -- Note: This requires the service role key, so we'll use a different approach
  -- For now, return NULL to indicate this needs to be done differently
  RAISE EXCEPTION 'Direct user creation from client not supported. Use Supabase Admin API.';
END;
$$;

REVOKE ALL ON FUNCTION public.admin_create_user(text, text, text, text, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_user(text, text, text, text, app_role) TO authenticated;

-- Alternative: Function to assign roles to existing users
CREATE OR REPLACE FUNCTION public.admin_assign_role(
  target_user_id uuid,
  new_role public.app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_exists integer;
BEGIN
  -- Check if the caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;

  -- Check if user profile exists
  SELECT COUNT(*) INTO profile_exists FROM public.profiles WHERE id = target_user_id;
  IF profile_exists = 0 THEN
    RAISE EXCEPTION 'User profile not found. The user may not have been created properly.';
  END IF;

  -- Insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_assign_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_assign_role(uuid, app_role) TO authenticated;

-- Function to remove roles from users
CREATE OR REPLACE FUNCTION public.admin_remove_role(
  target_user_id uuid,
  role_to_remove public.app_role
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can remove roles';
  END IF;

  -- Delete the role
  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = role_to_remove;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_remove_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_remove_role(uuid, app_role) TO authenticated;

-- Function to delete a user (admin only)
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_count integer;
BEGIN
  -- Check if the caller is an admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  -- Prevent deleting yourself
  IF auth.uid() = target_user_id THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;

  -- Check if user exists
  SELECT COUNT(*) INTO role_count FROM public.profiles WHERE id = target_user_id;
  IF role_count = 0 THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Delete user roles first
  DELETE FROM public.user_roles WHERE user_id = target_user_id;

  -- Delete profile
  DELETE FROM public.profiles WHERE id = target_user_id;

  -- Note: We cannot delete from auth.users via client-side functions
  -- This requires service role key. The profile deletion is sufficient
  -- to prevent access, and the auth user can be cleaned up separately.

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

-- Enhanced RLS policies for equipment based on roles
DROP POLICY IF EXISTS "equipment_staff_write" ON public.equipment;
DROP POLICY IF EXISTS "equipment_admin_write" ON public.equipment;
DROP POLICY IF EXISTS "equipment_manager_write" ON public.equipment;
DROP POLICY IF EXISTS "equipment_staff_read" ON public.equipment;

CREATE POLICY "equipment_admin_write" ON public.equipment FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "equipment_manager_write" ON public.equipment FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'manager')) 
WITH CHECK (public.has_role(auth.uid(), 'manager'));

-- Staff can only read equipment, not write
CREATE POLICY "equipment_staff_read" ON public.equipment FOR SELECT TO authenticated 
USING (public.is_staff(auth.uid()));

-- Enhanced RLS policies for enquiries
DROP POLICY IF EXISTS "enquiries_staff_update" ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_admin_update" ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_manager_update" ON public.enquiries;
DROP POLICY IF EXISTS "enquiries_staff_read" ON public.enquiries;

CREATE POLICY "enquiries_admin_update" ON public.enquiries FOR UPDATE TO authenticated 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "enquiries_manager_update" ON public.enquiries FOR UPDATE TO authenticated 
USING (public.has_role(auth.uid(), 'manager')) 
WITH CHECK (public.has_role(auth.uid(), 'manager'));

-- Staff can only read enquiries
CREATE POLICY "enquiries_staff_read" ON public.enquiries FOR SELECT TO authenticated 
USING (public.is_staff(auth.uid()));

-- Enhanced RLS policies for customers
DROP POLICY IF EXISTS "customers_staff_all" ON public.customers;
DROP POLICY IF EXISTS "customers_admin_all" ON public.customers;
DROP POLICY IF EXISTS "customers_manager_all" ON public.customers;
DROP POLICY IF EXISTS "customers_staff_read" ON public.customers;

CREATE POLICY "customers_admin_all" ON public.customers FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'admin')) 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "customers_manager_all" ON public.customers FOR ALL TO authenticated 
USING (public.has_role(auth.uid(), 'manager')) 
WITH CHECK (public.has_role(auth.uid(), 'manager'));

-- Staff can only read customers
CREATE POLICY "customers_staff_read" ON public.customers FOR SELECT TO authenticated 
USING (public.is_staff(auth.uid()));