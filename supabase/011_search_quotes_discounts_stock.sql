-- ============================================================================
-- KingBoostFarms — 011: search-ready fields, quote requests, discount codes,
--                        low-stock alerts, and a stock-change log
-- Run ONCE in the Supabase SQL editor, after 010. Safe to re-run.
-- ============================================================================

-- 1. Low stock -----------------------------------------------------------------
-- A per-product threshold (Admin > Products). If empty, the site-wide default
-- in store_settings is used. Both start unset, so nothing emails until you set one.
alter table public.products add column if not exists low_stock_threshold integer;
alter table public.store_settings add column if not exists low_stock_threshold integer;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_low_stock_threshold_check') then
    alter table public.products add constraint products_low_stock_threshold_check check (low_stock_threshold is null or low_stock_threshold >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'store_settings_low_stock_threshold_check') then
    alter table public.store_settings add constraint store_settings_low_stock_threshold_check check (low_stock_threshold is null or low_stock_threshold >= 0);
  end if;
end $$;

-- 2. Stock change log ------------------------------------------------------------
-- Every change to a product's stock, whoever or whatever caused it (an order,
-- a cancellation, or an admin editing the number by hand).
create table if not exists public.stock_log (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid references public.products(id) on delete set null,
  product_name   text not null,
  previous_stock integer not null,
  new_stock      integer not null,
  change         integer not null,
  changed_by     uuid references auth.users(id),
  created_at     timestamptz not null default now()
);

alter table public.stock_log enable row level security;
drop policy if exists "stock_log: staff read" on public.stock_log;
create policy "stock_log: staff read" on public.stock_log for select using (public.is_staff());
-- No insert/update/delete policy for anyone: only the trigger below (as the table owner) writes to it.

create or replace function public.log_stock_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stock is distinct from old.stock then
    insert into public.stock_log (product_id, product_name, previous_stock, new_stock, change, changed_by)
    values (new.id, new.name, old.stock, new.stock, new.stock - old.stock, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists products_log_stock_change on public.products;
create trigger products_log_stock_change
  after update of stock on public.products
  for each row execute function public.log_stock_change();

-- 3. Quote requests (businesses asking about a list of items) --------------------
create table if not exists public.quote_requests (
  id            uuid primary key default gen_random_uuid(),
  company_name  text,
  contact_name  text not null check (char_length(contact_name) between 1 and 200),
  email         text not null check (char_length(email) between 3 and 320),
  phone         text,
  items         jsonb not null,   -- [{ "name": "Rice", "quantity": 50, "unit": "bag" }, ...]
  message       text,
  status        text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at    timestamptz not null default now()
);

alter table public.quote_requests enable row level security;

drop policy if exists "quote_requests: public insert" on public.quote_requests;
create policy "quote_requests: public insert" on public.quote_requests
  for insert with check (
    status = 'new'
    and char_length(contact_name) between 1 and 200
    and char_length(email) between 3 and 320
    and jsonb_typeof(items) = 'array'
    and jsonb_array_length(items) between 1 and 100
  );

drop policy if exists "quote_requests: staff read" on public.quote_requests;
drop policy if exists "quote_requests: staff update" on public.quote_requests;
create policy "quote_requests: staff read"   on public.quote_requests for select using (public.is_staff());
create policy "quote_requests: staff update" on public.quote_requests for update using (public.is_staff()) with check (public.is_staff());

-- 4. Discount codes --------------------------------------------------------------
create table if not exists public.discount_codes (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  kind         text not null check (kind in ('percent', 'fixed')),
  amount       numeric(12,2) not null check (amount > 0),
  min_subtotal numeric(12,2) not null default 0 check (min_subtotal >= 0),
  max_uses     integer check (max_uses is null or max_uses > 0),
  used_count   integer not null default 0,
  starts_at    timestamptz,
  expires_at   timestamptz,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'discount_codes_percent_range_check') then
    alter table public.discount_codes
      add constraint discount_codes_percent_range_check check (kind <> 'percent' or amount <= 100);
  end if;
end $$;

alter table public.discount_codes enable row level security;
drop policy if exists "discount_codes: admin all" on public.discount_codes;
create policy "discount_codes: admin all" on public.discount_codes
  for all using (public.is_admin()) with check (public.is_admin());
-- No public read policy: codes are looked up only through the functions below
-- (security definer), so the full code list can't be browsed by visitors.

-- Preview a code's discount without redeeming it (used by the checkout page's "Apply" button).
create or replace function public.preview_discount_code(p_code text, p_subtotal numeric)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_code public.discount_codes%rowtype;
  v_discount numeric;
begin
  select * into v_code from public.discount_codes where lower(code) = lower(btrim(coalesce(p_code, '')));
  if not found or not v_code.is_active then
    return jsonb_build_object('valid', false, 'message', 'That code is not valid.');
  end if;
  if v_code.starts_at is not null and now() < v_code.starts_at then
    return jsonb_build_object('valid', false, 'message', 'That code is not active yet.');
  end if;
  if v_code.expires_at is not null and now() > v_code.expires_at then
    return jsonb_build_object('valid', false, 'message', 'That code has expired.');
  end if;
  if v_code.max_uses is not null and v_code.used_count >= v_code.max_uses then
    return jsonb_build_object('valid', false, 'message', 'That code has already been used up.');
  end if;
  if p_subtotal < v_code.min_subtotal then
    return jsonb_build_object('valid', false, 'message', format('This code needs a minimum order of %s.', to_char(v_code.min_subtotal, 'FM999,999,990.00')));
  end if;

  v_discount := case when v_code.kind = 'percent' then round(p_subtotal * v_code.amount / 100, 2) else v_code.amount end;
  v_discount := least(v_discount, p_subtotal);
  return jsonb_build_object('valid', true, 'discount', v_discount, 'kind', v_code.kind, 'amount', v_code.amount);
end;
$$;

revoke all on function public.preview_discount_code(text, numeric) from public;
grant execute on function public.preview_discount_code(text, numeric) to anon, authenticated;

-- 5. place_order(): now also applies VAT + delivery/pickup (from 009) AND a discount code -----
drop function if exists public.place_order(text, text, text, text, jsonb, text, uuid);

create or replace function public.place_order(
  p_name          text,
  p_email         text,
  p_phone         text,
  p_address       text,
  p_items         jsonb,
  p_method        text default 'delivery',
  p_zone_id       uuid default null,
  p_discount_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id     uuid;
  v_token        uuid;
  v_subtotal     numeric := 0;
  v_vat_pct      numeric := 0;
  v_vat          numeric := 0;
  v_delivery     numeric := 0;
  v_discount     numeric := 0;
  v_disc_code    text;
  v_total        numeric := 0;
  v_pickup_on    boolean := false;
  v_pickup_addr  text;
  v_pickup_note  text;
  v_has_zones    boolean := false;
  v_zone         public.delivery_zones%rowtype;
  v_zone_name    text;
  v_address      text;
  v_item         jsonb;
  v_qty          integer;
  v_prod         public.products%rowtype;
  v_code         public.discount_codes%rowtype;
begin
  if coalesce(btrim(p_name), '') = '' or coalesce(btrim(p_email), '') = '' then
    raise exception 'Name and email are required.';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'Too many items in one order.';
  end if;

  p_method := coalesce(nullif(btrim(p_method), ''), 'delivery');
  if p_method not in ('delivery', 'pickup') then
    raise exception 'Invalid delivery option.';
  end if;

  select coalesce(vat_percent, 0), coalesce(pickup_enabled, false), pickup_address, pickup_instructions
    into v_vat_pct, v_pickup_on, v_pickup_addr, v_pickup_note
    from public.store_settings
   where id = 1;
  v_vat_pct := coalesce(v_vat_pct, 0);

  if p_method = 'pickup' then
    if not coalesce(v_pickup_on, false) then
      raise exception 'Self pickup is not available right now.';
    end if;
    v_delivery := 0;
    v_address  := 'Self pickup' || coalesce(' — ' || nullif(btrim(v_pickup_addr), ''), '');
  else
    if coalesce(btrim(p_address), '') = '' then
      raise exception 'Delivery address is required.';
    end if;
    v_address := btrim(p_address);

    select exists (select 1 from public.delivery_zones where is_active) into v_has_zones;
    if v_has_zones then
      if p_zone_id is null then
        raise exception 'Please choose your delivery area.';
      end if;
      select * into v_zone from public.delivery_zones where id = p_zone_id and is_active;
      if not found then
        raise exception 'That delivery area is not available.';
      end if;
      v_delivery  := v_zone.fee;
      v_zone_name := v_zone.name;
    end if;
  end if;

  insert into public.orders
    (buyer_name, buyer_email, buyer_phone, delivery_address, total_amount, status, fulfilment_method, delivery_zone)
  values
    (btrim(p_name), btrim(p_email), nullif(btrim(coalesce(p_phone, '')), ''), v_address, 0, 'pending', p_method, v_zone_name)
  returning id, cancel_token into v_order_id, v_token;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty <= 0 or v_qty > 1000 then
      raise exception 'Invalid quantity.';
    end if;

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

    v_subtotal := v_subtotal + (v_prod.price * v_qty);
  end loop;

  -- Discount code: re-checked here (never trust a discount amount from the browser),
  -- and only actually redeemed (used_count +1) once the order is really being created.
  if coalesce(btrim(p_discount_code), '') <> '' then
    select * into v_code from public.discount_codes where lower(code) = lower(btrim(p_discount_code)) for update;
    if not found or not v_code.is_active then
      raise exception 'That discount code is not valid.';
    end if;
    if v_code.starts_at is not null and now() < v_code.starts_at then
      raise exception 'That discount code is not active yet.';
    end if;
    if v_code.expires_at is not null and now() > v_code.expires_at then
      raise exception 'That discount code has expired.';
    end if;
    if v_code.max_uses is not null and v_code.used_count >= v_code.max_uses then
      raise exception 'That discount code has already been used up.';
    end if;
    if v_subtotal < v_code.min_subtotal then
      raise exception 'This discount code needs a minimum order of %.', to_char(v_code.min_subtotal, 'FM999,999,990.00');
    end if;

    v_discount := case when v_code.kind = 'percent' then round(v_subtotal * v_code.amount / 100, 2) else v_code.amount end;
    v_discount := least(v_discount, v_subtotal);
    v_disc_code := v_code.code;

    update public.discount_codes set used_count = used_count + 1 where id = v_code.id;
  end if;

  v_vat   := round((v_subtotal - v_discount) * v_vat_pct / 100, 2);
  v_total := (v_subtotal - v_discount) + v_vat + v_delivery;

  update public.orders
     set subtotal_amount = v_subtotal,
         vat_percent     = v_vat_pct,
         vat_amount      = v_vat,
         delivery_fee    = v_delivery,
         total_amount    = v_total,
         discount_code   = v_disc_code,
         discount_amount = v_discount
   where id = v_order_id;

  return jsonb_build_object(
    'order_id',            v_order_id,
    'total',               v_total,
    'subtotal',            v_subtotal,
    'vat_percent',         v_vat_pct,
    'vat',                 v_vat,
    'delivery',            v_delivery,
    'discount',             v_discount,
    'discount_code',        v_disc_code,
    'method',              p_method,
    'zone',                v_zone_name,
    'address',             v_address,
    'pickup_instructions', case when p_method = 'pickup' then v_pickup_note else null end,
    'cancel_token',        v_token
  );
end;
$$;

alter table public.orders add column if not exists discount_code   text;
alter table public.orders add column if not exists discount_amount numeric(12,2) not null default 0;

revoke all on function public.place_order(text, text, text, text, jsonb, text, uuid, text) from public;
grant execute on function public.place_order(text, text, text, text, jsonb, text, uuid, text) to anon, authenticated;
