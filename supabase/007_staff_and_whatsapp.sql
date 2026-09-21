-- ============================================================================
-- KingBoostFarms — 007: staff logins + WhatsApp number
-- Run ONCE in the Supabase SQL editor, after 006. Safe to re-run.
--
--   * admins.role: 'admin' (full access, as today) or 'staff' (Orders and Messages only).
--     Everyone already in `admins` stays a full admin.
--   * is_admin() now means "full admin"; is_staff() means "admin OR staff".
--     Staff may read and update orders and read/update customer messages, and nothing else
--     (not products, settings, refunds, or site content).
--   * store_settings.whatsapp_number: the number behind the WhatsApp buttons on the site.
-- ============================================================================

-- 1. Roles --------------------------------------------------------------------
alter table public.admins add column if not exists role text not null default 'admin';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'admins_role_check') then
    alter table public.admins add constraint admins_role_check check (role in ('admin', 'staff'));
  end if;
end $$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where id = auth.uid());
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to anon, authenticated;

-- 2. What staff may touch: orders and customer messages -------------------------
drop policy if exists "orders: staff read"   on public.orders;
drop policy if exists "orders: staff update" on public.orders;
create policy "orders: staff read"   on public.orders for select using (public.is_staff());
create policy "orders: staff update" on public.orders for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "order_items: staff read" on public.order_items;
create policy "order_items: staff read" on public.order_items for select using (public.is_staff());

drop policy if exists "inquiries: staff read"   on public.inquiries;
drop policy if exists "inquiries: staff update" on public.inquiries;
create policy "inquiries: staff read"   on public.inquiries for select using (public.is_staff());
create policy "inquiries: staff update" on public.inquiries for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "enrollments: staff read"   on public.enrollments;
drop policy if exists "enrollments: staff update" on public.enrollments;
create policy "enrollments: staff read"   on public.enrollments for select using (public.is_staff());
create policy "enrollments: staff update" on public.enrollments for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "bookings: staff read"   on public.consulting_bookings;
drop policy if exists "bookings: staff update" on public.consulting_bookings;
create policy "bookings: staff read"   on public.consulting_bookings for select using (public.is_staff());
create policy "bookings: staff update" on public.consulting_bookings for update using (public.is_staff()) with check (public.is_staff());

-- Staff need the product/course names shown on orders and sign-ups: those tables are already
-- readable by everyone for active items. (Hidden items still show as "Deleted product" for staff.)

-- 3. WhatsApp ------------------------------------------------------------------
alter table public.store_settings add column if not exists whatsapp_number text;
