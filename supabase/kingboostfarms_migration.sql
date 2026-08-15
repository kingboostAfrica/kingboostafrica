-- ============================================================================
-- KingBoostFarms migration
-- Rebrands the schema from the KingBoostAfrica multi-farmer marketplace to
-- the single-admin KingBoostFarms site (Food Mart, Academy, Consulting,
-- Agritech, Organics).
-- Run this against the existing kingboostafrica_schema.sql database.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Drop the farmer system
-- ----------------------------------------------------------------------------
alter table if exists products drop column if exists farmer_id;
alter table if exists order_items drop column if exists farmer_id;
alter table if exists gallery_items drop column if exists farmer_id;

drop table if exists farmers cascade;

-- ----------------------------------------------------------------------------
-- 2. Academy
-- ----------------------------------------------------------------------------
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  description text,
  duration text,
  price numeric not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Consulting
-- ----------------------------------------------------------------------------
create table if not exists consulting_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  description text,
  price_from numeric,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists consulting_bookings (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references consulting_services(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  company text,
  preferred_date date,
  message text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. Agritech / Organics / General contact — shared inquiries table
-- ----------------------------------------------------------------------------
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('agritech', 'organics', 'general')),
  full_name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. Row Level Security
-- ----------------------------------------------------------------------------
alter table courses enable row level security;
alter table enrollments enable row level security;
alter table consulting_services enable row level security;
alter table consulting_bookings enable row level security;
alter table inquiries enable row level security;

-- Public can read active courses/services
create policy "Public can view active courses" on courses
  for select using (is_active = true);

create policy "Public can view active consulting services" on consulting_services
  for select using (is_active = true);

-- Public (anon) can submit enrollments, bookings, and inquiries
create policy "Public can create enrollments" on enrollments
  for insert with check (true);

create policy "Public can create consulting bookings" on consulting_bookings
  for insert with check (true);

create policy "Public can create inquiries" on inquiries
  for insert with check (true);

-- Authenticated admin (any logged-in user, since this is single-admin) can
-- manage everything
create policy "Admin can manage courses" on courses
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admin can view enrollments" on enrollments
  for select using (auth.role() = 'authenticated');

create policy "Admin can manage consulting services" on consulting_services
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admin can view consulting bookings" on consulting_bookings
  for select using (auth.role() = 'authenticated');

create policy "Admin can view inquiries" on inquiries
  for select using (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 6. Products/gallery: ensure admin-only write access remains (farmer_id
--    column removed above already means old farmer-scoped policies referencing
--    it must be dropped and recreated as admin-only).
-- ----------------------------------------------------------------------------
drop policy if exists "Farmers can manage own products" on products;
drop policy if exists "Farmers can manage own gallery items" on gallery_items;

create policy "Admin can manage products" on products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Admin can manage gallery items" on gallery_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
