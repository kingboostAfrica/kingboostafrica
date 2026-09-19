-- ============================================================================
-- KingBoostFarms — 004: online payment (Paystack) support
-- Run ONCE in the Supabase SQL editor, after 002 and 003. Safe to re-run.
-- ============================================================================

-- 1. Orders remember how they are paid and when payment was confirmed.
alter table public.orders add column if not exists payment_method text not null default 'delivery';
alter table public.orders add column if not exists payment_reference text;
alter table public.orders add column if not exists paid_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_payment_method_check') then
    alter table public.orders
      add constraint orders_payment_method_check check (payment_method in ('delivery', 'online'));
  end if;
end $$;

-- A Paystack reference can belong to only one order.
create unique index if not exists orders_payment_reference_uidx
  on public.orders (payment_reference) where payment_reference is not null;

-- 2. Online orders that are never paid must not hold stock forever.
--    The site calls this (with the server key only) whenever someone checks out;
--    cancelling an order automatically puts its stock back (see 002).
create or replace function public.release_stale_online_orders(p_hours integer default 3)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  update public.orders
     set status = 'cancelled'
   where payment_method = 'online'
     and status = 'pending'
     and created_at < now() - make_interval(hours => p_hours);
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.release_stale_online_orders(integer) from public, anon, authenticated;
grant execute on function public.release_stale_online_orders(integer) to service_role;
