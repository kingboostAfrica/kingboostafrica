-- ============================================================================
-- KingBoostFarms — 002: security hardening + admin tooling
-- Run this ONCE in the Supabase SQL editor, AFTER the earlier schema and
-- kingboostfarms_migration.sql. It is safe to re-run (idempotent).
--
-- What it does
--   1. Creates/locks the `admins` table and an is_admin() helper.
--   2. Replaces every "any logged-in user is admin" policy with is_admin(),
--      so a random Supabase signup can no longer read customer data or edit
--      products. (RLS is the real security layer; the app-level redirect is
--      only a convenience.)
--   3. Makes `orders` / `order_items` private (admin-only).
--   4. Adds place_order(): server-side price + stock validation, stock
--      decrement, all in one transaction. Checkout no longer trusts prices
--      sent by the browser.
--   5. Restores stock automatically when an order is cancelled.
--   6. Ensures `page_content` exists (with the unique key the editor needs)
--      and seeds the default text so the Site Content editor has rows to edit.
--
-- BEFORE running: make sure your admin user has a row in `admins`
-- (see step 1b below — it inserts kingboost.africa@gmail.com if that
-- auth user exists).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. admins + is_admin()
-- ----------------------------------------------------------------------------
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 1b. make sure the site owner is an admin (no-op if already there / no such user)
insert into public.admins (id)
select id from auth.users where email = 'kingboost.africa@gmail.com'
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. page_content (Site Content editor)
-- ----------------------------------------------------------------------------
create table if not exists public.page_content (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text not null,
  key text not null,
  sort_order integer not null default 0,
  title text,
  body text,
  icon text,
  image_url text,
  updated_at timestamptz not null default now()
);

-- The admin editor upserts with onConflict "page,section,key".
create unique index if not exists page_content_page_section_key_uidx
  on public.page_content (page, section, key);

-- ----------------------------------------------------------------------------
-- 3. Reset RLS: drop every existing policy on the app tables, then recreate
--    a clean, explicit set.
-- ----------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'admins','categories','products','gallery_items','courses',
        'consulting_services','enrollments','consulting_bookings',
        'inquiries','orders','order_items','page_content'
      )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.admins              enable row level security;
alter table public.categories          enable row level security;
alter table public.products            enable row level security;
alter table public.gallery_items       enable row level security;
alter table public.courses             enable row level security;
alter table public.consulting_services enable row level security;
alter table public.enrollments         enable row level security;
alter table public.consulting_bookings enable row level security;
alter table public.inquiries           enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.page_content        enable row level security;

-- admins: a signed-in user may read only their own row (used by requireAdmin()).
-- No insert/update/delete policies: manage admins from the SQL editor only.
create policy "admins: read own row" on public.admins
  for select using (id = auth.uid());

-- Public catalogue content ----------------------------------------------------
create policy "categories: public read" on public.categories
  for select using (true);
create policy "categories: admin write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "products: public read active" on public.products
  for select using (is_active = true);
create policy "products: admin all" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "gallery: public read" on public.gallery_items
  for select using (true);
create policy "gallery: admin write" on public.gallery_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy "courses: public read active" on public.courses
  for select using (is_active = true);
create policy "courses: admin all" on public.courses
  for all using (public.is_admin()) with check (public.is_admin());

create policy "consulting: public read active" on public.consulting_services
  for select using (is_active = true);
create policy "consulting: admin all" on public.consulting_services
  for all using (public.is_admin()) with check (public.is_admin());

create policy "page_content: public read" on public.page_content
  for select using (true);
create policy "page_content: admin write" on public.page_content
  for all using (public.is_admin()) with check (public.is_admin());

-- Public forms: anyone may INSERT (with sane limits), only admins may read/manage.
create policy "enrollments: public insert" on public.enrollments
  for insert with check (
    status = 'pending' and char_length(full_name) between 1 and 200
    and char_length(email) between 3 and 320
  );
create policy "enrollments: admin all" on public.enrollments
  for all using (public.is_admin()) with check (public.is_admin());

create policy "bookings: public insert" on public.consulting_bookings
  for insert with check (
    status = 'pending' and char_length(full_name) between 1 and 200
    and char_length(email) between 3 and 320
    and (message is null or char_length(message) <= 5000)
  );
create policy "bookings: admin all" on public.consulting_bookings
  for all using (public.is_admin()) with check (public.is_admin());

create policy "inquiries: public insert" on public.inquiries
  for insert with check (
    status = 'new' and char_length(full_name) between 1 and 200
    and char_length(email) between 3 and 320
    and char_length(message) between 1 and 5000
  );
create policy "inquiries: admin all" on public.inquiries
  for all using (public.is_admin()) with check (public.is_admin());

-- Orders are private. Customers create them ONLY through place_order() below.
create policy "orders: admin all" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());
create policy "order_items: admin all" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. place_order(): trusted checkout
-- ----------------------------------------------------------------------------
create or replace function public.place_order(
  p_name    text,
  p_email   text,
  p_phone   text,
  p_address text,
  p_items   jsonb          -- [{ "product_id": "<uuid>", "quantity": 2 }, ...]
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_total    numeric := 0;
  v_item     jsonb;
  v_qty      integer;
  v_prod     public.products%rowtype;
begin
  if coalesce(btrim(p_name), '') = '' or coalesce(btrim(p_email), '') = '' then
    raise exception 'Name and email are required.';
  end if;
  if coalesce(btrim(p_address), '') = '' then
    raise exception 'Delivery address is required.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'Too many items in one order.';
  end if;

  insert into public.orders (buyer_name, buyer_email, buyer_phone, delivery_address, total_amount, status)
  values (btrim(p_name), btrim(p_email), nullif(btrim(coalesce(p_phone, '')), ''), btrim(p_address), 0, 'pending')
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty <= 0 or v_qty > 1000 then
      raise exception 'Invalid quantity.';
    end if;

    -- lock the row so two buyers cannot both take the last unit
    select * into v_prod
    from public.products
    where id = (v_item->>'product_id')::uuid and is_active = true
    for update;

    if not found then
      raise exception 'One of the items in your cart is no longer available.';
    end if;
    if v_prod.stock < v_qty then
      raise exception 'Only % % of "%" left in stock.', v_prod.stock, v_prod.unit, v_prod.name;
    end if;

    update public.products set stock = stock - v_qty, updated_at = now() where id = v_prod.id;

    insert into public.order_items (order_id, product_id, quantity, unit_price)
    values (v_order_id, v_prod.id, v_qty, v_prod.price);

    v_total := v_total + (v_prod.price * v_qty);
  end loop;

  update public.orders set total_amount = v_total where id = v_order_id;

  return jsonb_build_object('order_id', v_order_id, 'total', v_total);
end;
$$;

revoke all on function public.place_order(text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, jsonb) to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. Cancelling an order puts the stock back
-- ----------------------------------------------------------------------------
create or replace function public.restock_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'A cancelled order cannot be re-opened. Ask the customer to place a new order.';
  end if;

  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products p
       set stock = p.stock + oi.quantity, updated_at = now()
      from public.order_items oi
     where oi.order_id = new.id and oi.product_id = p.id;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_restock_on_cancel on public.orders;
create trigger orders_restock_on_cancel
  before update of status on public.orders
  for each row execute function public.restock_on_cancel();

-- ----------------------------------------------------------------------------
-- 6. Seed default site content (only inserts rows that don't exist yet, so
--    anything you've already edited is left alone)
-- ----------------------------------------------------------------------------
insert into public.page_content (page, section, key, sort_order, title, body, icon) values
  ('home', 'hero', 'main', 0, 'Cultivating growth, nourishing nations.', 'KingBoostFarms is a Nigerian agribusiness spanning food retail, education, consulting, technology, and organics — built to strengthen agriculture from farm to table.', null),
  ('home', 'vertical', 'food-mart', 1, 'Food Mart', 'Pure, natural, nutritious produce', null),
  ('home', 'vertical', 'academy', 2, 'Academy', 'Training & courses in agribusiness', null),
  ('home', 'vertical', 'consulting', 3, 'Consulting', 'Expert agribusiness advisory', null),
  ('home', 'vertical', 'agritech', 4, 'Agritech', 'Technology for modern farming', null),
  ('home', 'vertical', 'organics', 5, 'Organics', 'Certified organic solutions', null),
  ('home', 'trust', 'trust-1', 1, 'Quality you can trust', 'Every product and service meets our brand standard for quality and integrity.', 'ShieldCheck'),
  ('home', 'trust', 'trust-2', 2, 'Sustainable by design', 'Our farming and consulting practices are built for long-term agricultural health.', 'Sprout'),
  ('home', 'trust', 'trust-3', 3, 'Five verticals, one mission', 'From the mart to the classroom to the field — we support agriculture at every stage.', 'Leaf'),
  ('about', 'intro', 'main', 0, 'Growing Value. Nourishing Lives.', E'KingBoostFarms is a Nigerian agribusiness built to strengthen agriculture from the ground up — from the food on the table, to the knowledge that grows a farm, to the technology and organic practices that make it all sustainable.\n\nWe operate across five verticals — Food Mart, Academy, Consulting, Agritech, and Organics — each dedicated to a different part of the agricultural value chain, united by one mission: cultivating growth and nourishing nations.', null),
  ('about', 'vertical', 'food-mart', 1, 'Food Mart', 'Pure, natural, nutritious produce sold direct to households and businesses.', null),
  ('about', 'vertical', 'academy', 2, 'Academy', 'Training and courses that build agribusiness skills across Nigeria.', null),
  ('about', 'vertical', 'consulting', 3, 'Consulting', 'Expert advisory for farms, cooperatives, and agribusinesses.', null),
  ('about', 'vertical', 'agritech', 4, 'Agritech', 'Practical technology that makes modern farming more productive.', null),
  ('about', 'vertical', 'organics', 5, 'Organics', 'Certified organic inputs and produce for a healthier food system.', null),
  ('about', 'pillar', 'mission', 1, 'Our Mission', 'Deliver pure, natural, nutritious food and dependable agribusiness services across Nigeria.', 'Target'),
  ('about', 'pillar', 'community', 2, 'Our Community', 'Customers, learners, farms, and partners we serve across our five verticals.', 'Users'),
  ('about', 'pillar', 'sustainability', 3, 'Sustainability', 'Every product and service is built with long-term agricultural health in mind.', 'Leaf'),
  ('agritech', 'intro', 'main', 0, 'Technology for modern farming', 'We bring practical technology to Nigerian farms — helping growers make better decisions, use fewer resources, and produce more consistent yields.', null),
  ('agritech', 'capability', 'capability-1', 1, 'Precision Farming', 'Satellite and sensor-driven insights to plan planting, monitor crop health, and optimize yield.', 'Satellite'),
  ('agritech', 'capability', 'capability-2', 2, 'Smart Irrigation', 'Automated irrigation systems that reduce water waste while keeping crops healthy.', 'Droplets'),
  ('agritech', 'capability', 'capability-3', 3, 'Farm Data & Analytics', 'Dashboards that turn field data into decisions — from input planning to harvest forecasting.', 'BarChart3'),
  ('agritech', 'capability', 'capability-4', 4, 'Equipment & Automation', 'Modern tools and automation that reduce labor costs and increase consistency.', 'Cpu'),
  ('organics', 'intro', 'main', 0, 'Certified organic solutions', 'KingBoostFarms Organics supports growers and buyers who want food and farming free of synthetic chemicals — from inputs and certification to sourcing certified organic produce.', null),
  ('organics', 'offering', 'offering-1', 1, 'Certified Organic Inputs', 'Organic fertilizers, compost, and soil amendments free of synthetic chemicals.', 'Leaf'),
  ('organics', 'offering', 'offering-2', 2, 'Certification Support', 'Guidance for farms pursuing organic certification and compliant practices.', 'ShieldCheck'),
  ('organics', 'offering', 'offering-3', 3, 'Organic Produce Sourcing', 'Sourcing and supply of certified organic crops for retail and food service.', 'Sprout'),
  ('organics', 'offering', 'offering-4', 4, 'Sustainable Practices', 'Composting, crop rotation, and natural pest management consulting.', 'Recycle')
on conflict (page, section, key) do nothing;
