INSERT INTO public.site_posts (kind, title, slug, excerpt, publish_date, published, image_url)
VALUES
  ('news', 'A stronger equipment partner for Niger Delta projects', 'niger-delta-equipment-partner', 'We are expanding our mobilisation support for contractors working across Bayelsa, riverine communities and the wider Niger Delta.', '2026-09-03', true, null),
  ('blog', 'Choosing the right machine for difficult terrain', 'choosing-machines-for-difficult-terrain', 'A practical guide to matching excavators, dozers and support equipment to access, ground conditions and programme demands.', '2026-08-28', true, null),
  ('incoming', 'New lifting and dredging capacity on the horizon', 'new-lifting-and-dredging-capacity', 'Ask our team about upcoming crane and dredging equipment availability so we can reserve capacity for your next project.', current_date, true, null)
ON CONFLICT (slug) DO NOTHING;
