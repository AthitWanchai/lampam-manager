-- lampam-manager รุ่นแรก: ร่างโพสต์และไฟล์รูป
create extension if not exists pgcrypto;

create type public.post_status as enum ('draft', 'ready', 'scheduled', 'published', 'archived');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  body text not null default '',
  status public.post_status not null default 'draft',
  facebook_post_id text,
  scheduled_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index posts_status_updated_idx on public.posts(status, updated_at desc);
create index post_media_post_order_idx on public.post_media(post_id, sort_order);
create unique index post_media_post_path_unique on public.post_media(post_id, storage_path);

alter table public.posts enable row level security;
alter table public.post_media enable row level security;

-- รุ่นทดลอง: ผู้ใช้ที่ล็อกอินแล้วจัดการข้อมูลใน workspace เดียวกันได้
create policy "authenticated users can read posts"
  on public.posts for select to authenticated using (true);
create policy "authenticated users can create posts"
  on public.posts for insert to authenticated with check (auth.uid() = created_by);
create policy "authenticated users can update posts"
  on public.posts for update to authenticated using (true) with check (true);
create policy "authenticated users can delete posts"
  on public.posts for delete to authenticated using (true);

create policy "authenticated users can read media"
  on public.post_media for select to authenticated using (true);
create policy "authenticated users can manage media"
  on public.post_media for all to authenticated using (true) with check (true);

-- สร้าง bucket ชื่อ post-media ใน Dashboard แล้วตั้งให้เป็น private
