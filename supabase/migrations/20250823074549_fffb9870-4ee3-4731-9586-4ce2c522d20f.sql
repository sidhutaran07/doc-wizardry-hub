-- Create public storage bucket for PDF outputs if it doesn't exist
insert into storage.buckets (id, name, public)
values ('pdf-files', 'pdf-files', true)
on conflict (id) do nothing;

-- Allow public read access to files in the 'pdf-files' bucket
create policy "Public read access to pdf-files"
on storage.objects
for select
using (bucket_id = 'pdf-files');

-- Allow uploads to the 'pdf-files' bucket (used by Edge Functions)
create policy "Anyone can upload to pdf-files"
on storage.objects
for insert
with check (bucket_id = 'pdf-files');