-- ============================================================================
-- KingBoostFarms — 013: customer accounts, wishlist, product reviews, rate limiting
-- Run ONCE in the Supabase SQL editor, after 012. Safe to re-run.
--
--   * customer_profiles : a customer's saved name, phone and delivery address.
--   * wishlist_items    : products a logged-in customer has hearted.
--   * reviews           : star ratings + comments. Only customers who BOUGHT the product can
--                         post one, and it stays hidden until you approve it in Admin > Reviews.
--   * public_reviews    : the safe, public view of approved reviews (no user ids).
--   * my_orders()       : a customer's own order history (matched on their CONFIRMED email).
--   * rate_limit_hit()  : the counter behind the spam / stock-hogging protection.
--
-- Admin and staff access is unchanged: it is still decided only by the `admins` table,
-- so a customer account can never open /admin or read other people's data.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Helpers
-- ----------------------------------------------------------------------------

-- True only when the logged-in user has CONFIRMED their email address.
create or replace function public.has_confirmed_email()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.has_confirmed_email() from public, anon;
grant execute on function public.has_confirmed_email() to authenticated;

-- True when the logged-in customer (confirmed email) has a paid / shipped / completed order
-- containing this product.
create or replace function public.has_purchased(p_product uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users u
    join public.orders o on lower(o.buyer_email) = lower(u.email)
    join public.order_items oi on oi.order_id = o.id
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
      and oi.product_id = p_product
      and o.status in ('paid', 'shipped', 'completed')
  );
$$;
revoke all on function public.has_purchased(uuid) from public, anon;
grant execute on function public.has_purchased(uuid) to authenticated;

-- ----------------------------------------------------------------------------
-- 2. Customer profiles
-- ----------------------------------------------------------------------------
create table if not exists public.customer_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  address    text,
  updated_at timestamptz not null default now()
);
alter table public.customer_profiles enable row level security;

drop policy if exists "profiles: read own" on public.customer_profiles;
create policy "profiles: read own" on public.customer_profiles
  for select using (user_id = auth.uid());
drop policy if exists "profiles: insert own" on public.customer_profiles;
create policy "profiles: insert own" on public.customer_profiles
  for insert with check (user_id = auth.uid());
drop policy if exists "profiles: update own" on public.customer_profiles;
create policy "profiles: update own" on public.customer_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "profiles: admin read" on public.customer_profiles;
create policy "profiles: admin read" on public.customer_profiles
  for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. Wishlist
-- ----------------------------------------------------------------------------
create table if not exists public.wishlist_items (
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table public.wishlist_items enable row level security;

drop policy if exists "wishlist: read own" on public.wishlist_items;
create policy "wishlist: read own" on public.wishlist_items
  for select using (user_id = auth.uid());
drop policy if exists "wishlist: add own" on public.wishlist_items;
create policy "wishlist: add own" on public.wishlist_items
  for insert with check (user_id = auth.uid());
drop policy if exists "wishlist: remove own" on public.wishlist_items;
create policy "wishlist: remove own" on public.wishlist_items
  for delete using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4. Reviews
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  reviewer_name text not null,
  rating        integer not null check (rating between 1 and 5),
  title         text,
  body          text,
  status        text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at    timestamptz not null default now(),
  unique (product_id, user_id)
);
create index if not exists reviews_product_status_idx on public.reviews (product_id, status);
alter table public.reviews enable row level security;

drop policy if exists "reviews: read own" on public.reviews;
create policy "reviews: read own" on public.reviews
  for select using (user_id = auth.uid());
-- A customer can add one review per product, only for something they bought, always as "pending".
drop policy if exists "reviews: add own after purchase" on public.reviews;
create policy "reviews: add own after purchase" on public.reviews
  for insert with check (
    user_id = auth.uid()
    and status = 'pending'
    and public.has_purchased(product_id)
  );
drop policy if exists "reviews: remove own" on public.reviews;
create policy "reviews: remove own" on public.reviews
  for delete using (user_id = auth.uid());
drop policy if exists "reviews: admin all" on public.reviews;
create policy "reviews: admin all" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- What the public product page reads: approved reviews only, and no user ids.
create or replace view public.public_reviews as
  select id, product_id, reviewer_name, rating, title, body, created_at
  from public.reviews
  where status = 'approved';
grant select on public.public_reviews to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 5. A customer's own order history
--    Matched on the customer's CONFIRMED email, so nobody can read someone else's orders.
-- ----------------------------------------------------------------------------
create or replace function public.my_orders()
returns jsonb
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.created_at desc), '[]'::jsonb)
  from (
    select
      o.id,
      upper(left(o.id::text, 8)) as ref,
      o.created_at,
      o.status,
      o.total_amount,
      o.payment_method,
      o.fulfilment_method,
      o.cancel_token,
      (
        select coalesce(jsonb_agg(jsonb_build_object(
          'product_id', oi.product_id,
          'name', p.name,
          'slug', p.slug,
          'quantity', oi.quantity,
          'unit_price', oi.unit_price
        )), '[]'::jsonb)
        from public.order_items oi
        left join public.products p on p.id = oi.product_id
        where oi.order_id = o.id
      ) as items
    from auth.users u
    join public.orders o on lower(o.buyer_email) = lower(u.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
    order by o.created_at desc
    limit 100
  ) t;
$$;
revoke all on function public.my_orders() from public, anon;
grant execute on function public.my_orders() to authenticated;

-- ----------------------------------------------------------------------------
-- 6. Rate limiting (used by the website's public forms and checkout)
--    Only the server (service role) can call this; browsers cannot.
-- ----------------------------------------------------------------------------
create table if not exists public.rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  hits         integer not null default 0
);
alter table public.rate_limits enable row level security;  -- no policies: nobody but the server can touch it

create or replace function public.rate_limit_hit(p_key text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits integer;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case
      when r.window_start < now() - make_interval(secs => p_window_seconds) then 1
      else r.hits + 1
    end,
    window_start = case
      when r.window_start < now() - make_interval(secs => p_window_seconds) then now()
      else r.window_start
    end
  returning hits into v_hits;

  -- Occasional housekeeping so the table stays tiny.
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_max;
end;
$$;
revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;
