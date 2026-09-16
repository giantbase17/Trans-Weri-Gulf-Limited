-- Enterprise role hierarchy, step 1 of 2: add the three new roles this
-- project doesn't already have. admin/manager/staff are untouched — this is
-- purely additive.
--
-- IMPORTANT: run this file ALONE, in its own SQL Editor execution, and let
-- it finish before running 20260916110000_enterprise_role_permissions.sql.
-- Postgres will not let a newly-added enum value be referenced by a policy
-- or query in the same transaction it was added in.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'equipment_manager';
