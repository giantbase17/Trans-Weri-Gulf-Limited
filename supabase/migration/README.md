# Migration tracking

These files are **not** applied automatically — there is no Supabase CLI
project linked, so every file here has to be opened and run manually in the
Supabase SQL Editor (project `wydfkyjcbrbewwaubqno`), **in filename order**
(the timestamp prefix is the run order, oldest first).

When you add a new migration file, run it in the SQL Editor, then flip its
row below from ⬜ to ✅ so this list stays a source of truth for "what's
actually live in the database" — the repo having a `.sql` file only means
someone wrote it, not that it ran.

## Status

| # | File | Purpose | Run in Supabase? |
|---|------|---------|-------------------|
| 1 | `20260901175442_*.sql` | Initial schema: roles, profiles, equipment, enquiries, RLS enums | ✅ |
| 2 | `20260901175456_*.sql` | Initial schema continued | ✅ |
| 3 | `20260901175530_*.sql` | Initial schema continued | ✅ |
| 4 | `20260903120000_bootstrap_first_admin.sql` | Seeds the first admin user | ✅ |
| 5 | `20260903130000_site_content.sql` | `site_settings`, `site_posts` tables | ✅ |
| 6 | `20260903140000_auto_customer_from_enquiry.sql` | Trigger: enquiry → customer record | ✅ |
| 7 | `20260903150000_seed_homepage_updates.sql` | Seed data for homepage News/Updates | ✅ |
| 8 | `20260904100000_admin_user_management.sql` | Admin user CRUD support | ✅ |
| 9 | `20260905120000_equipment_sales_and_invitations.sql` | Equipment sale/purchase fields, invite flow (invite flow later removed, see #21 note) | ✅ |
| 10 | `20260905130000_multi_currency_enhancements.sql` | NGN/USD dual pricing | ✅ |
| 11 | `20260916000000_lead_workflow.sql` | Enquiry status pipeline, assignee, follow-up date | ✅ |
| 12 | `20260916010000_create_equipment_photos_bucket.sql` | Creates `equipment-photos` storage bucket | ✅ |
| 13 | `20260916100000_add_enterprise_roles.sql` | Adds `super_admin`/`sales_manager`/`equipment_manager` to `app_role` enum | ✅ |
| 14 | `20260916110000_enterprise_role_permissions.sql` | RLS policy updates for the new roles | ✅ |
| 15 | `20260916120000_enquiry_contact_method.sql` | Adds `preferred_contact`, `duration_days` to `enquiries` | ✅ |
| 16 | `20260916130000_dynamic_equipment_categories.sql` | Converts `equipment.category` enum → FK to `equipment_categories` table | ✅ |
| 17 | `20260916140000_fix_enquiry_insert_policy.sql` | **Fix**: re-asserts missing `enquiries` INSERT policy (was causing RLS errors on enquiry submit) | ✅ |
| 18 | `20260916150000_fix_site_settings_upsert.sql` | **Fix**: adds missing `site_settings` INSERT policy (`.upsert()` needs it) | ✅ |
| 19 | `20260916160000_site_post_link.sql` | Adds `link_url` to `site_posts` (News/Blog CTA link) | ✅ |
| 20 | `20260916170000_fix_equipment_images_policy.sql` | **Fix**: re-asserts `equipment_images` + `equipment-photos` bucket policies | ✅ |
| 21 | `20260916180000_update_business_address.sql` | Updates registered address to Ekeki Housing Estate | ✅ |
| 22 | `20260916190000_enquiry_service_type.sql` | Adds `service_type` to `enquiries` (Enquiry form service picker) | ✅ |
| 23 | `20260916200000_rls_audit_fixes.sql` | **Fix**: re-asserts `site_settings` policies, adds the previously-missing `site-assets` storage DELETE policy | ✅ |
| 24 | `20260917000000_correct_business_address.sql` | **Fix**: corrects the address to No. 3 Okaka Estate, Yenagoa (#21 had wrongly changed it to Ekeki Housing Estate) | ⬜ **run this one next** |

## Why fixes get their own file instead of editing the original

Postgres migrations here are pasted and run once, by hand — there's no
migration table tracking what ran, so an older file can't be safely edited
after the fact (you'd have no way to know whether the edited version was
ever actually re-run). When a policy turns out to be missing or wrong, the
fix is a new, later-dated file that `DROP POLICY IF EXISTS` + `CREATE
POLICY`s the correct version, rather than a hand-edit of the original.

## Known recurring bug pattern

Several "row violates row-level security policy" errors this project hit
turned out to be a table/bucket with RLS enabled but missing the policy for
one specific command (e.g. SELECT+UPDATE exist but INSERT doesn't). If a
new one of these turns up: test directly with `curl` against
`https://wydfkyjcbrbewwaubqno.supabase.co/rest/v1/<table>` using the anon
key to confirm which command is actually failing, rather than guessing from
the app-level error message.
