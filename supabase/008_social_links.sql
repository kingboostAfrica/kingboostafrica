-- ============================================================================
-- KingBoostFarms — 008: social media links (managed in Admin > Social media)
-- Run ONCE in the Supabase SQL editor, after 007. Safe to re-run.
-- ============================================================================
create table if not exists public.social_links (
  platform   text primary key,
  url        text not null check (url ~* '^https://[^\s]+$' and char_length(url) <= 500),
  is_active  boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.social_links enable row level security;

drop policy if exists "social_links: public read active" on public.social_links;
create policy "social_links: public read active" on public.social_links
  for select using (is_active = true);

drop policy if exists "social_links: admin all" on public.social_links;
create policy "social_links: admin all" on public.social_links
  for all using (public.is_admin()) with check (public.is_admin());
