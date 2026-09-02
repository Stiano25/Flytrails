-- Post-level photo gallery for blog posts (separate from cover image_url)
alter table public.blog_posts
  add column if not exists gallery jsonb not null default '[]'::jsonb;
