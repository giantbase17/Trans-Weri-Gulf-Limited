-- Equipment categories become admin-manageable instead of a fixed enum.
-- Existing categories and every equipment row's assignment are preserved
-- exactly — this only removes the hard limit on adding new ones.

CREATE TABLE public.equipment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text UNIQUE NOT NULL,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.equipment_categories TO anon, authenticated;
GRANT ALL ON public.equipment_categories TO service_role;
ALTER TABLE public.equipment_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equipment_categories_public_read" ON public.equipment_categories
FOR SELECT TO anon, authenticated USING (true);

-- Same roles that can already manage equipment can manage its categories.
CREATE POLICY "equipment_categories_admin_write" ON public.equipment_categories
FOR ALL TO authenticated
USING (public.is_admin_tier(auth.uid())) WITH CHECK (public.is_admin_tier(auth.uid()));

CREATE POLICY "equipment_categories_manager_write" ON public.equipment_categories
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'manager')) WITH CHECK (public.has_role(auth.uid(), 'manager'));

CREATE POLICY "equipment_categories_equipment_manager_write" ON public.equipment_categories
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'equipment_manager')) WITH CHECK (public.has_role(auth.uid(), 'equipment_manager'));

-- Seed with the categories the site already uses, in their current order.
INSERT INTO public.equipment_categories (value, label, sort_order) VALUES
  ('excavators', 'Excavators', 1),
  ('bulldozers', 'Bulldozers', 2),
  ('wheel_loaders', 'Wheel Loaders', 3),
  ('motor_graders', 'Motor Graders', 4),
  ('cranes', 'Cranes', 5),
  ('dump_trucks', 'Dump Trucks', 6),
  ('generators', 'Generators & Power Equipment', 7),
  ('others', 'Others', 8)
ON CONFLICT (value) DO NOTHING;

-- Convert equipment.category from the fixed enum to free text, backed by
-- a foreign key into the new table instead. Renaming a category's value
-- cascades to every equipment row; a category still in use can't be
-- deleted outright.
ALTER TABLE public.equipment ALTER COLUMN category DROP DEFAULT;
ALTER TABLE public.equipment ALTER COLUMN category TYPE text USING category::text;
ALTER TABLE public.equipment ALTER COLUMN category SET DEFAULT 'others';
ALTER TABLE public.equipment
  ADD CONSTRAINT equipment_category_fkey FOREIGN KEY (category)
  REFERENCES public.equipment_categories(value)
  ON UPDATE CASCADE ON DELETE RESTRICT;

DROP TYPE public.equipment_category;
