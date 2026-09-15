CREATE TYPE public.site_content_kind AS ENUM ('news', 'blog', 'incoming');

CREATE TABLE public.site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  company_name text NOT NULL DEFAULT 'Trans Weri Gulf Limited',
  tagline text,
  phone text,
  email text,
  address text,
  logo_url text,
  facebook_url text,
  instagram_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (company_name, tagline, phone, email, address, facebook_url, instagram_url)
VALUES ('Trans Weri Gulf Limited', 'Heavy-duty machinery & equipment rental in Yenagoa, Bayelsa State', '07071649524', 'transwerigulflimited@gmail.com', 'No. 3 Okaka Estate, Yenagoa, Bayelsa State, Nigeria, 560211', 'https://www.facebook.com/share/1E8KaYgpQw/?mibextid=wwXIfr', 'https://www.instagram.com/transwerigulflimited?igsi=Mm91M3V5ZDJ4NDV1')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE public.site_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.site_content_kind NOT NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL,
  body text,
  image_url text,
  publish_date date NOT NULL DEFAULT current_date,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings, public.site_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings, public.site_posts TO authenticated;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_settings_staff_write" ON public.site_settings FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "site_posts_public_read" ON public.site_posts FOR SELECT TO anon USING (published = true);
CREATE POLICY "site_posts_auth_read" ON public.site_posts FOR SELECT TO authenticated USING (published = true OR public.is_staff(auth.uid()));
CREATE POLICY "site_posts_staff_write" ON public.site_posts FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER t_site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_site_posts_updated BEFORE UPDATE ON public.site_posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', false) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "site_assets_staff_read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'site-assets' AND public.is_staff(auth.uid()));
CREATE POLICY "site_assets_staff_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-assets' AND public.is_staff(auth.uid()));
CREATE POLICY "site_assets_staff_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-assets' AND public.is_staff(auth.uid())) WITH CHECK (bucket_id = 'site-assets' AND public.is_staff(auth.uid()));
