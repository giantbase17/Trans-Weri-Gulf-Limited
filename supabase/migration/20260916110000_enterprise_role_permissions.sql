-- Enterprise role hierarchy, step 2 of 2: wire up permissions for the three
-- new roles added in 20260916100000_add_enterprise_roles.sql.
--
-- Run this AFTER that file has finished executing on its own.
--
-- Proposed permission matrix (mirrors src/lib/site.ts ROLE_PERMISSIONS):
--   super_admin        — everything (same as admin)
--   sales_manager      — enquiries + customers only
--   equipment_manager  — equipment only
-- admin/manager/staff policies are untouched.

-- Unified "top tier" check so admin-gated policies also recognise the new
-- super_admin role without duplicating every policy.
CREATE OR REPLACE FUNCTION public.is_admin_tier(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'super_admin');
$$;

-- Every existing admin also becomes a super_admin (per the agreed migration
-- approach: additive, existing admins get full top-level control under the
-- new hierarchy too).
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'super_admin'::public.app_role
FROM public.user_roles
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Profiles / roles visibility: let super_admin see all users, same as admin.
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin_tier(auth.uid()));

DROP POLICY IF EXISTS "roles_select_own" ON public.user_roles;
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin_tier(auth.uid()));

-- Equipment: super_admin gets full access (like admin); equipment_manager
-- gets full access too, scoped to just this table.
DROP POLICY IF EXISTS "equipment_admin_write" ON public.equipment;
CREATE POLICY "equipment_admin_write" ON public.equipment FOR ALL TO authenticated
USING (public.is_admin_tier(auth.uid())) WITH CHECK (public.is_admin_tier(auth.uid()));

DROP POLICY IF EXISTS "equipment_equipment_manager_write" ON public.equipment;
CREATE POLICY "equipment_equipment_manager_write" ON public.equipment FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'equipment_manager'))
WITH CHECK (public.has_role(auth.uid(), 'equipment_manager'));

-- Enquiries: super_admin gets full admin access; sales_manager can update
-- (same shape as the existing "manager" policy) but not delete.
DROP POLICY IF EXISTS "enquiries_admin_update" ON public.enquiries;
CREATE POLICY "enquiries_admin_update" ON public.enquiries FOR UPDATE TO authenticated
USING (public.is_admin_tier(auth.uid())) WITH CHECK (public.is_admin_tier(auth.uid()));

DROP POLICY IF EXISTS "enquiries_admin_delete" ON public.enquiries;
CREATE POLICY "enquiries_admin_delete" ON public.enquiries FOR DELETE TO authenticated
USING (public.is_admin_tier(auth.uid()));

DROP POLICY IF EXISTS "enquiries_sales_manager_update" ON public.enquiries;
CREATE POLICY "enquiries_sales_manager_update" ON public.enquiries FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'sales_manager'))
WITH CHECK (public.has_role(auth.uid(), 'sales_manager'));

-- Customers: super_admin gets full admin access; sales_manager gets full
-- access too (same shape as the existing "manager" policy).
DROP POLICY IF EXISTS "customers_admin_all" ON public.customers;
CREATE POLICY "customers_admin_all" ON public.customers FOR ALL TO authenticated
USING (public.is_admin_tier(auth.uid())) WITH CHECK (public.is_admin_tier(auth.uid()));

DROP POLICY IF EXISTS "customers_sales_manager_all" ON public.customers;
CREATE POLICY "customers_sales_manager_all" ON public.customers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'sales_manager'))
WITH CHECK (public.has_role(auth.uid(), 'sales_manager'));

-- Role/user management RPCs: recognise super_admin as an admin-tier caller.
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
  IF NOT public.is_admin_tier(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;

  SELECT COUNT(*) INTO profile_exists FROM public.profiles WHERE id = target_user_id;
  IF profile_exists = 0 THEN
    RAISE EXCEPTION 'User profile not found. The user may not have been created properly.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

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
  IF NOT public.is_admin_tier(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can remove roles';
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = target_user_id AND role = role_to_remove;

  RETURN true;
END;
$$;

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
  IF NOT public.is_admin_tier(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

  IF auth.uid() = target_user_id THEN
    RAISE EXCEPTION 'You cannot delete your own account';
  END IF;

  SELECT COUNT(*) INTO role_count FROM public.profiles WHERE id = target_user_id;
  IF role_count = 0 THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;

  RETURN true;
END;
$$;
