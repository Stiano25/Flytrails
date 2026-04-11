-- Public bucket for testimonial author photos (max ~10 MB; enforced in app + optional DB limit)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'testimonials',
  'testimonials',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read testimonial images" on storage.objects;
drop policy if exists "Authenticated upload testimonial images" on storage.objects;
drop policy if exists "Authenticated update testimonial images" on storage.objects;
drop policy if exists "Authenticated delete testimonial images" on storage.objects;

create policy "Public read testimonial images"
  on storage.objects for select
  to public
  using (bucket_id = 'testimonials');

create policy "Authenticated upload testimonial images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'testimonials');

create policy "Authenticated update testimonial images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'testimonials');

create policy "Authenticated delete testimonial images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'testimonials');
