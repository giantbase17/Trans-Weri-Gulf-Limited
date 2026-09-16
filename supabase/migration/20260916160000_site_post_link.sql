-- Lets an admin attach an outbound link to a news/blog/incoming-equipment
-- post — clicking the card on the public site opens it automatically.
ALTER TABLE public.site_posts ADD COLUMN IF NOT EXISTS link_url text;
