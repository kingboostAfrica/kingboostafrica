-- ============================================================================
-- KingBoostFarms — 010: order tracking, receipts and packing slips
-- Run ONCE in the Supabase SQL editor, after 009. Safe to re-run.
--
--   * orders remember WHEN they were shipped / completed / cancelled, so the tracking page
--     can show a real timeline (and receipts show dates).
--   * store_settings gets optional business details printed on receipts:
--     RC number, VAT/TIN number, phone.
--   * find_order_for_tracking(): lets the "Track my order" page look up an order from the
--     order number + email. Only the server (service key) can call it.
-- ============================================================================

-- 1. Status dates ---------------------------------------------------------------
alter table public.orders add column if not exists shipped_at   timestamptz;
alter table public.orders add column if not exists completed_at timestamptz;
alter table public.orders add column if not exists cancelled_at timestamptz;

create or replace function public.stamp_order_status()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'shipped'   then new.shipped_at   := coalesce(new.shipped_at,   now()); end if;
    if new.status = 'completed' then new.completed_at := coalesce(new.completed_at, now()); end if;
    if new.status = 'cancelled' then new.cancelled_at := coalesce(new.cancelled_at, now()); end if;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_stamp_status on public.orders;
create trigger orders_stamp_status
  before update of status on public.orders
  for each row execute function public.stamp_order_status();

-- 2. Business details for receipts ------------------------------------------------
alter table public.store_settings add column if not exists business_rc    text;
alter table public.store_settings add column if not exists business_tin   text;
alter table public.store_settings add column if not exists business_phone text;

-- 3. Order lookup for the tracking page ---------------------------------------------
create or replace function public.find_order_for_tracking(p_ref text, p_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
    from public.orders
   where lower(buyer_email) = lower(btrim(p_email))
     and replace(id::text, '-', '') like lower(regexp_replace(btrim(p_ref), '[^0-9a-zA-Z]', '', 'g')) || '%'
     and char_length(regexp_replace(btrim(p_ref), '[^0-9a-zA-Z]', '', 'g')) >= 8
   order by created_at desc
   limit 1;
$$;

revoke all on function public.find_order_for_tracking(text, text) from public, anon, authenticated;
grant execute on function public.find_order_for_tracking(text, text) to service_role;
