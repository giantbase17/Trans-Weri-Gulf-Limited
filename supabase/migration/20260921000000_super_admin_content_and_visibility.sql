-- Super admin permissions, part 1: draws a real line between admin and
-- super_admin instead of the two being functionally identical.
--
--   1. Site content (company info, logo, hero/news/blog/incoming posts and
--      their images) is now super_admin-only to write. admin keeps every
--      other permission it had.
--   2. admin can no longer see that super_admin accounts exist at all —
--      not in profiles/user_roles reads, not via the role-management RPCs.
--      super_admin still sees everyone, including other super_admins.
--   3. Only a super_admin can grant the super_admin role, and admin can no
--      longer create, edit the roles of, or delete a super_admin account
--      (closes the gap where an admin could otherwise act on a super_admin
--      whose id they already knew, even without being able to list them).
--
-- src/lib/site.ts ROLE_PERMISSIONS.admin.canManageContent flips to false in
-- the same change that ships this migration — this is the matching
-- database-level enforcement, since RLS previously only checked is_staff().

-- Unified "does this admin-tier caller need to be blind to this target"
-- check — true when the caller is admin (not super_admin) and the target
-- holds the super_admin role.
CREATE OR REPLACE FUNCTION public.admin_blind_to_target(_target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(auth.uid(), 'admin')
    AND NOT public.has_role(auth.uid(), 'super_admin')
    AND public.has_role(_target_user_id, 'super_admin');
$$;

-- profiles / user_roles: super_admin sees everyone; admin sees everyone
-- except accounts holding the super_admin role.
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR (public.is_admin_tier(auth.uid()) AND NOT public.admin_blind_to_target(id))
);

DROP POLICY IF EXISTS "roles_select_own" ON public.user_roles;
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR (public.is_admin_tier(auth.uid()) AND NOT public.admin_blind_to_target(user_id))
);

-- Site content: company info/logo and news/blog/incoming posts (the
-- "hero pages and write-ups") become super_admin-only to write. Public and
-- staff read access is unchanged.
DROP POLICY IF EXISTS "site_settings_staff_write" ON public.site_settings;
CREATE POLICY "site_settings_super_admin_write" ON public.site_settings
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "site_posts_staff_write" ON public.site_posts;
CREATE POLICY "site_posts_super_admin_write" ON public.site_posts
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "site_assets_staff_write" ON storage.objects;
CREATE POLICY "site_assets_super_admin_write" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "site_assets_staff_update" ON storage.objects;
CREATE POLICY "site_assets_super_admin_update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "site_assets_staff_delete" ON storage.objects;
CREATE POLICY "site_assets_super_admin_delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'site-assets' AND public.has_role(auth.uid(), 'super_admin'));

-- Role-management RPCs: admin can no longer grant super_admin, and can no
-- longer act on an account that already holds super_admin.
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

  IF new_role = 'super_admin' AND NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only a super admin can grant the super admin role';
  END IF;

  IF public.admin_blind_to_target(target_user_id) THEN
    RAISE EXCEPTION 'User profile not found. The user may not have been created properly.';
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

  IF public.admin_blind_to_target(target_user_id) THEN
    RAISE EXCEPTION 'User profile not found. The user may not have been created properly.';
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

  IF public.admin_blind_to_target(target_user_id) THEN
    RAISE EXCEPTION 'User not found';
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
