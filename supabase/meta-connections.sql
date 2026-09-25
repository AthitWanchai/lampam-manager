-- รันหลังจาก schema.sql เมื่อเริ่มเก็บการเชื่อมต่อ Meta จริง
create table if not exists public.facebook_pages (
  id uuid primary key default gen_random_uuid(),
  page_id text not null unique,
  page_name text not null,
  page_tasks text[] not null default '{}',
  access_token_ciphertext text not null,
  connected_by uuid not null references auth.users(id) on delete cascade,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.facebook_pages enable row level security;
create policy "owners can read facebook pages" on public.facebook_pages
  for select to authenticated using (auth.uid() = connected_by);
create policy "owners can manage facebook pages" on public.facebook_pages
  for all to authenticated using (auth.uid() = connected_by) with check (auth.uid() = connected_by);
