-- ============================================================================
-- KingBoostFarms — 014: richer home page (farm updates, best sellers, editable sections)
-- Run ONCE in the Supabase SQL editor, after 013. Safe to re-run.
--
--   * farm_updates          : short news posts shown on the home page and at /updates
--                             (Admin > Farm updates).
--   * top_selling_products  : a ranking only (no sales numbers) that lets the home page show
--                             "Best sellers" once customers have bought things.
--   * page_content          : seeds the editable "Why KingBoost" and "From our farm to your table"
--                             sections on the home page (Admin > Site content > Home Page).
-- ============================================================================

-- 1. Farm updates ------------------------------------------------------------
create table if not exists public.farm_updates (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text,
  image_url    text,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists farm_updates_published_idx on public.farm_updates (is_published, published_at desc);
alter table public.farm_updates enable row level security;

drop policy if exists "farm_updates: public read published" on public.farm_updates;
create policy "farm_updates: public read published" on public.farm_updates
  for select using (is_published);
drop policy if exists "farm_updates: admin all" on public.farm_updates;
create policy "farm_updates: admin all" on public.farm_updates
  for all using (public.is_admin()) with check (public.is_admin());

-- 2. Best sellers (ranking only; sales numbers are not exposed) --------------
create or replace view public.top_selling_products as
  select oi.product_id,
         row_number() over (order by sum(oi.quantity) desc, oi.product_id) as rank
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where o.status in ('paid', 'shipped', 'completed')
  group by oi.product_id
  order by sum(oi.quantity) desc, oi.product_id
  limit 12;
grant select on public.top_selling_products to anon, authenticated;

-- 3. Editable home page sections ---------------------------------------------
insert into public.page_content (page, section, key, sort_order, title, body, icon) values
  ('home', 'why', 'why-1', 1, '100% natural',          'Pure, natural food made from the crops we grow and source.', 'Leaf'),
  ('home', 'why', 'why-2', 2, 'No preservatives',      'Our Food Mart packs are made without added preservatives.', 'ShieldCheck'),
  ('home', 'why', 'why-3', 3, 'Hygienically processed', 'Prepared and packed with care, in clean conditions.', 'Sparkles'),
  ('home', 'why', 'why-4', 4, 'Premium quality',       'Carefully selected and packed to a standard we are proud to put our name on.', 'Award'),
  ('home', 'process', 'step-1', 1, 'We grow',    'Crops such as cassava, plantain, maize, tomato and okra grow on our farm in Igbanko, Badagry.', 'Sprout'),
  ('home', 'process', 'step-2', 2, 'We process', 'Harvests are prepared, dried or milled into flours, garri, dried fish and more.', 'Factory'),
  ('home', 'process', 'step-3', 3, 'We package', 'Every product is sealed in a labelled Kingboost Foodmart pack.', 'Package'),
  ('home', 'process', 'step-4', 4, 'We deliver', 'Delivered to your area, or ready to collect where pickup is offered.', 'Truck')
on conflict (page, section, key) do nothing;
