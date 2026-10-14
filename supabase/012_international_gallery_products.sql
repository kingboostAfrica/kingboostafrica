-- ============================================================================
-- KingBoostFarms — 012: international customers, country fields, gallery ↔ product links
-- Run ONCE in the Supabase SQL editor, after 011. Safe to re-run.
--
--   * store_settings.usd_exchange_rate: the Naira-per-Dollar rate YOU choose (Admin > Settings).
--     It is only used to show an approximate dollar price next to Naira prices. Customers are
--     still charged in Naira through Paystack; foreign cards are converted by the customer's bank.
--   * enrollments.country / consulting_bookings.country: where the person applying is based.
--   * gallery_items.product_id: optionally link a gallery photo to a Food Mart product, so hovering
--     the photo shows that product's name, price and a link to it.
-- ============================================================================
alter table public.store_settings add column if not exists usd_exchange_rate numeric(12,2);
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'store_settings_usd_rate_check') then
    alter table public.store_settings
      add constraint store_settings_usd_rate_check check (usd_exchange_rate is null or usd_exchange_rate > 0);
  end if;
end $$;

alter table public.enrollments          add column if not exists country text;
alter table public.consulting_bookings  add column if not exists country text;

alter table public.gallery_items add column if not exists product_id uuid references public.products(id) on delete set null;
create index if not exists gallery_items_product_id_idx on public.gallery_items (product_id);
