-- ============================================================================
-- KingBoostFarms — 005: VAT, delivery areas + self pickup, customer self-cancel
-- Run ONCE in the Supabase SQL editor, after 002, 003 and 004. Safe to re-run.
--
--   1. store_settings: one row with the VAT percentage and the self-pickup details.
--   2. delivery_zones: the areas you deliver to, each with its own fee (edited in Admin > Settings).
--   3. orders remember the subtotal / VAT / delivery fee / area / pickup they were charged for.
--   4. place_order() adds VAT and the delivery fee ON THE SERVER, so the total the customer pays
--      (and what Paystack charges) can't be changed from the browser.
--   5. every order gets a private cancel-link token for customer self-cancellation.
--
-- Nothing changes for customers until you set things up in Admin > Settings:
-- VAT starts at 0, pickup starts switched off, and with no delivery areas delivery is free.
-- ============================================================================

-- 1. Settings (a single row) -------------------------------------------------
create table if not exists public.store_settings (
  id                  integer primary key default 1 check (id = 1),
  vat_percent         numeric(5,2) not null default 0 check (vat_percent >= 0 and vat_percent <= 100),
  pickup_enabled      boolean      not null default false,
  pickup_address      text,
  pickup_instructions text,
  updated_at          timestamptz  not null default now()
);

insert into public.store_settings (id) values (1) on conflict (id) do nothing;

alter table public.store_settings enable row level security;
drop policy if exists "store_settings: public read" on public.store_settings;
create policy "store_settings: public read" on public.store_settings
  for select using (true);
drop policy if exists "store_settings: admin write" on public.store_settings;
create policy "store_settings: admin write" on public.store_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- 2. Delivery areas, each with its own fee ------------------------------------
create table if not exists public.delivery_zones (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(btrim(name)) between 1 and 100),
  fee        numeric(12,2) not null default 0 check (fee >= 0),
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.delivery_zones enable row level security;
drop policy if exists "delivery_zones: public read active" on public.delivery_zones;
create policy "delivery_zones: public read active" on public.delivery_zones
  for select using (is_active = true);
drop policy if exists "delivery_zones: admin all" on public.delivery_zones;
create policy "delivery_zones: admin all" on public.delivery_zones
  for all using (public.is_admin()) with check (public.is_admin());

-- 3. What each order was charged ----------------------------------------------
alter table public.orders add column if not exists subtotal_amount   numeric(12,2);
alter table public.orders add column if not exists vat_percent       numeric(5,2)  not null default 0;
alter table public.orders add column if not exists vat_amount        numeric(12,2) not null default 0;
alter table public.orders add column if not exists delivery_fee      numeric(12,2) not null default 0;
alter table public.orders add column if not exists fulfilment_method text not null default 'delivery';
alter table public.orders add column if not exists delivery_zone     text;
alter table public.orders add column if not exists cancel_token      uuid not null default gen_random_uuid();
alter table public.orders add column if not exists cancelled_by      text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_fulfilment_method_check') then
    alter table public.orders
      add constraint orders_fulfilment_method_check check (fulfilment_method in ('delivery', 'pickup'));
  end if;
end $$;

create unique index if not exists orders_cancel_token_uidx on public.orders (cancel_token);

-- 4. Trusted checkout: VAT + delivery area / pickup -----------------------------
-- (The old 5-argument version is replaced by this 7-argument one.)
drop function if exists public.place_order(text, text, text, text, jsonb);

create or replace function public.place_order(
  p_name    text,
  p_email   text,
  p_phone   text,
  p_address text,
  p_items   jsonb,                      -- [{ "product_id": "<uuid>", "quantity": 2 }, ...]
  p_method  text default 'delivery',    -- 'delivery' or 'pickup'
  p_zone_id uuid default null           -- the delivery area chosen (delivery only)
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
    -- no delivery areas set up yet: delivery is free
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

  v_vat   := round(v_subtotal * v_vat_pct / 100, 2);   -- VAT is charged on the products, not on delivery
  v_total := v_subtotal + v_vat + v_delivery;

  update public.orders
     set subtotal_amount = v_subtotal,
         vat_percent     = v_vat_pct,
         vat_amount      = v_vat,
         delivery_fee    = v_delivery,
         total_amount    = v_total
   where id = v_order_id;

  return jsonb_build_object(
    'order_id',            v_order_id,
    'total',               v_total,
    'subtotal',            v_subtotal,
    'vat_percent',         v_vat_pct,
    'vat',                 v_vat,
    'delivery',            v_delivery,
    'method',              p_method,
    'zone',                v_zone_name,
    'address',             v_address,
    'pickup_instructions', case when p_method = 'pickup' then v_pickup_note else null end,
    'cancel_token',        v_token
  );
end;
$$;

revoke all on function public.place_order(text, text, text, text, jsonb, text, uuid) from public;
grant execute on function public.place_order(text, text, text, text, jsonb, text, uuid) to anon, authenticated;
