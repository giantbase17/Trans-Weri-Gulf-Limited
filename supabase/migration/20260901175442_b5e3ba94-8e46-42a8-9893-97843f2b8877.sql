-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','manager','staff');
CREATE TYPE public.equipment_category AS ENUM ('excavators','bulldozers','wheel_loaders','motor_graders','cranes','dump_trucks','generators','others');
CREATE TYPE public.availability_status AS ENUM ('available','rented','maintenance','unavailable');
CREATE TYPE public.enquiry_status AS ENUM ('new','contacted','quoted','won','lost');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- EQUIPMENT
CREATE TABLE public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category public.equipment_category NOT NULL DEFAULT 'others',
  brand text,
  model text,
  description text,
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  daily_rate numeric(12,2),
  weekly_rate numeric(12,2),
  monthly_rate numeric(12,2),
  currency text NOT NULL DEFAULT 'NGN',
  quote_only boolean NOT NULL DEFAULT false,
  status public.availability_status NOT NULL DEFAULT 'available',
  location text NOT NULL DEFAULT 'Yenagoa, Bayelsa State',
  total_units integer NOT NULL DEFAULT 1,
  available_units integer NOT NULL DEFAULT 1,
  rented_units integer NOT NULL DEFAULT 0,
  maintenance_units integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 1,
  primary_image_url text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.equipment TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO authenticated;
GRANT ALL ON public.equipment TO service_role;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipment_public_read" ON public.equipment FOR SELECT TO anon USING (published = true);
CREATE POLICY "equipment_auth_read" ON public.equipment FOR SELECT TO authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "equipment_staff_write" ON public.equipment FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.equipment_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.equipment_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment_images TO authenticated;
GRANT ALL ON public.equipment_images TO service_role;
ALTER TABLE public.equipment_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eqimg_public_read" ON public.equipment_images FOR SELECT TO anon USING (true);
CREATE POLICY "eqimg_auth_read" ON public.equipment_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "eqimg_staff_write" ON public.equipment_images FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- CUSTOMERS
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  company text,
  email text,
  phone text,
  address text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers_staff_all" ON public.customers FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ENQUIRIES
CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL DEFAULT ('TWG-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,6))),
  equipment_id uuid REFERENCES public.equipment(id) ON DELETE SET NULL,
  equipment_name text,
  full_name text NOT NULL,
  email text,
  phone text NOT NULL,
  company text,
  project_location text,
  rental_period text,
  start_date date,
  end_date date,
  message text,
  status public.enquiry_status NOT NULL DEFAULT 'new',
  assigned_to uuid,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enquiries_public_insert" ON public.enquiries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "enquiries_auth_insert" ON public.enquiries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "enquiries_staff_read" ON public.enquiries FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "enquiries_staff_update" ON public.enquiries FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "enquiries_admin_delete" ON public.enquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER t_equipment_updated BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_enquiries_updated BEFORE UPDATE ON public.enquiries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SEED EQUIPMENT
INSERT INTO public.equipment (name, slug, category, brand, model, description, specifications, daily_rate, weekly_rate, monthly_rate, quote_only, status, total_units, available_units, rented_units, maintenance_units, primary_image_url, featured) VALUES
('Caterpillar 336D2 Excavator','cat-336d2-excavator','excavators','Caterpillar','336D2','Heavy-duty 36-tonne class hydraulic excavator for bulk earthworks, dredging support and civil works across the Niger Delta.','{"Operating Weight":"36,000 kg","Engine Power":"268 hp","Bucket Capacity":"1.9 m3","Max Dig Depth":"7.2 m"}',450000,2700000,9500000,false,'available',3,2,1,0,'/__l5e/assets-v1/ad206aea-dc4d-4868-8681-6d3af35b0988/eq-p38_1.jpg',true),
('HBXG SD7N Bulldozer','hbxg-sd7n-bulldozer','bulldozers','HBXG','SD7N','Powerful crawler dozer with ripper attachment for land clearing, site levelling and road formation.','{"Operating Weight":"23,500 kg","Engine Power":"230 hp","Blade Capacity":"6.4 m3","Attachment":"Single shank ripper"}',420000,2500000,8800000,false,'available',4,3,1,0,'/__l5e/assets-v1/581e5ece-cf82-4d07-bbed-9029cf8c38a0/eq-p6_1.jpg',true),
('HBXG Crawler Dozer with Ripper','hbxg-crawler-dozer-ripper','bulldozers','HBXG','SD7','Track-type tractor configured for heavy ripping in laterite and rocky terrain.','{"Operating Weight":"23,000 kg","Blade Type":"Straight tilt","Track Gauge":"1,880 mm"}',400000,2400000,8500000,false,'available',2,2,0,0,'/__l5e/assets-v1/a05743a9-2417-41af-870b-9377785672a3/eq-p5_1.jpg',false),
('Caterpillar 950 Wheel Loader','cat-950-wheel-loader','wheel_loaders','Caterpillar','950','Versatile wheel loader for stockpile handling, truck loading and material rehandling.','{"Operating Weight":"18,500 kg","Bucket Capacity":"3.0 m3","Engine Power":"200 hp"}',300000,1800000,6400000,false,'available',3,2,1,0,'/__l5e/assets-v1/be56de27-cef6-4f48-8a76-6b7ae1cc2b67/eq-p13_1.jpg',true),
('Caterpillar Wheel Loader (Yard Spec)','cat-wheel-loader-yard','wheel_loaders','Caterpillar','950H','Yard-spec wheel loader ideal for quarry, sand and aggregate operations.','{"Operating Weight":"18,000 kg","Bucket Capacity":"2.8 m3","Tyres":"23.5-R25"}',285000,1700000,6000000,false,'available',2,1,1,0,'/__l5e/assets-v1/b013b4d3-d2c3-41ba-9657-c933a9357447/eq-p30_1.jpg',false),
('XCMG QY50K-II Truck Crane','xcmg-qy50k-truck-crane','cranes','XCMG','QY50K-II','50-tonne hydraulic truck crane for structural lifts, plant installation and marine yard work.','{"Max Lifting Capacity":"50 tonnes","Boom Length":"40 m","Jib":"15 m","Drive":"8x4"}',null,null,null,true,'available',2,1,1,0,'/__l5e/assets-v1/faa97fca-ab13-435d-b2e6-501a20e4da06/eq-p16_1.jpg',true),
('SANY SAC2200 All-Terrain Crane','sany-sac2200-crane','cranes','SANY','SAC2200','220-tonne class all-terrain crane for heavy industrial and oil & gas lifting operations.','{"Max Lifting Capacity":"220 tonnes","Main Boom":"72 m","Axles":"5"}',null,null,null,true,'available',2,2,0,0,'/__l5e/assets-v1/6ef5a543-30a7-4783-acf8-31b0d7b5b376/eq-p32_1.jpg',true),
('SANY Mobile Crane','sany-mobile-crane','cranes','SANY','STC series','Mobile telescopic crane for site erection, pipe handling and general lifting.','{"Max Lifting Capacity":"75 tonnes","Boom Length":"44 m","Outrigger Span":"7.2 m"}',null,null,null,true,'rented',3,1,2,0,'/__l5e/assets-v1/1ace0197-5f36-44af-a596-68e400ef3d05/eq-p18_1.jpg',false),
('HOWO TX 371 Tipper Truck','howo-tx-371-tipper','dump_trucks','SINOTRUK HOWO','TX 371','371 hp tipper truck for sand, laterite and aggregate haulage.','{"Payload":"30 tonnes","Engine Power":"371 hp","Drive":"6x4","Body":"Rock body tipper"}',180000,1050000,3800000,false,'available',6,4,2,0,'/__l5e/assets-v1/60e5a82f-3501-47fa-8f79-4fc9d46f20ea/eq-p3_1.jpg',true),
('Dump Truck & Crane Truck Combo','dump-crane-truck-combo','dump_trucks','SINOTRUK','Mixed fleet','Combined haulage package: tipper truck plus boom-mounted crane truck for site logistics.','{"Units":"2 trucks","Payload":"30 tonnes + 10 tonnes","Crane Reach":"12 m"}',260000,1560000,5600000,false,'available',2,2,0,0,'/__l5e/assets-v1/9521e6cd-fc54-498c-b36b-be9979895bd2/eq-p4_1.jpg',false),
('Dynapac CC1000 Road Roller','dynapac-cc1000-roller','others','Atlas Copco Dynapac','CC1000','Tandem vibratory roller for asphalt and base compaction on road projects.','{"Operating Weight":"2,600 kg","Drum Width":"1,000 mm","Vibration Frequency":"55 Hz"}',95000,560000,2000000,false,'available',4,3,0,1,'/__l5e/assets-v1/201562b7-f441-48b9-aab5-b69c6442dbbd/eq-p8_1.jpg',false),
('Atlas Copco Vibratory Roller','atlas-copco-vibratory-roller','others','Atlas Copco','CC1000 series','Compaction roller for road rehabilitation and estate infrastructure works.','{"Operating Weight":"2,600 kg","Drum Width":"1,000 mm"}',90000,540000,1900000,false,'maintenance',2,1,0,1,'/__l5e/assets-v1/1016b575-92bc-4460-b42d-5febd2142c50/eq-p25_1.jpg',false),
('Miller Welding Generator Set','miller-welding-generator','generators','Miller','Big Blue series','Diesel engine-driven welder/generator for fabrication, pipeline and marine works.','{"Weld Output":"400 A","Generator Power":"12 kW","Fuel":"Diesel"}',75000,450000,1600000,false,'available',10,8,2,0,'/__l5e/assets-v1/f398139a-e293-4c0c-abeb-804035865efd/eq-p11_1.jpg',true),
('Industrial Welding Machine Fleet','industrial-welding-machines','generators','Miller','Multi-unit','Containerised fleet of heavy-duty welding machines available for project mobilisation.','{"Units Available":"20","Weld Output":"400 A each","Delivery":"Containerised"}',45000,270000,950000,false,'available',20,16,4,0,'/__l5e/assets-v1/924b5fc2-31ee-43d5-bd5d-8c1296cf1a1c/eq-p39_1.jpg',false),
('Merlo DBM 3500EV Concrete Mixer','merlo-dbm-3500ev-mixer','others','Merlo','DBM 3500EV','Self-loading concrete mixer for remote pours and small-to-medium concrete works.','{"Drum Capacity":"3.5 m3","Drive":"4x4","Self Loading":"Yes"}',150000,900000,3200000,false,'available',2,2,0,0,'/__l5e/assets-v1/3ba08672-0fb2-452e-a1ac-69fda9b97cda/eq-p27_1.jpg',false),
('Jin Meng Cutter Suction Dredger','jin-meng-cutter-suction-dredger','others','Jin Meng','CSD series','Cutter suction dredger for sand mining, channel dredging and reclamation projects.','{"Discharge Diameter":"450 mm","Dredging Depth":"12 m","Cutter Power":"200 kW"}',null,null,null,true,'available',1,1,0,0,'/__l5e/assets-v1/c5f08164-1c14-485d-a152-64cd2c44cd71/eq-p20_1.jpg',true),
('Marine Work Boat with Deck Crane','marine-work-boat-crane','others','Custom Build','Work Boat','Shallow-draft work boat with deck crane for riverine logistics and marine support.','{"Length":"12 m","Crane Capacity":"3 tonnes","Draft":"1.1 m"}',null,null,null,true,'available',1,1,0,0,'/__l5e/assets-v1/c13741db-a152-48ad-81fd-7a824167844b/eq-p9_1.jpg',false),
('Telehandler & Roller Package','telehandler-roller-package','others','Mixed fleet','Package','Combined site package of telehandlers and rollers for estate and road contractors.','{"Units":"4","Lift Height":"17 m","Compaction Width":"1,000 mm"}',220000,1320000,4700000,false,'available',4,3,1,0,'/__l5e/assets-v1/fdbf6bb0-5a5c-4418-bd3e-bf9e2c3545af/eq-p19_1.jpg',false),
('Heavy Lift Crane (Flatbed Loading)','heavy-lift-crane-flatbed','cranes','XCMG','Heavy lift','Crane package configured for loading and offloading of heavy vessels and process equipment.','{"Max Lifting Capacity":"100 tonnes","Boom Length":"52 m"}',null,null,null,true,'available',1,1,0,0,'/__l5e/assets-v1/54784c93-5847-494d-9a6c-569b09ea898e/eq-p2_1.jpg',false),
('Motor Grader (Road Formation)','motor-grader-road-formation','motor_graders','Caterpillar','140 series','Motor grader for road formation, camber shaping and site grading works.','{"Blade Width":"3.7 m","Engine Power":"185 hp","Operating Weight":"16,000 kg"}',320000,1900000,6800000,false,'available',2,2,0,0,'/__l5e/assets-v1/01eac470-b905-4ffb-83e1-e289e4ac30ab/eq-p1_1.jpg',false);

INSERT INTO public.equipment_images (equipment_id, url, alt, sort_order)
SELECT id, primary_image_url, name, 0 FROM public.equipment WHERE primary_image_url IS NOT NULL;