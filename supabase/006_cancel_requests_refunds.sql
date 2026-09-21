-- ============================================================================
-- KingBoostFarms — 006: cancellation requests for PAID online orders + refunds
-- Run ONCE in the Supabase SQL editor, after 005. Safe to re-run.
--
--   * A customer who paid online can ask to cancel from the link in their email
--     (while the order is not yet shipped). The request is recorded here.
--   * In Admin > Orders you approve (Paystack refunds the money and the order is
--     cancelled, stock returns) or decline the request.
--   * refund_status tracks the refund: queued -> processed (or failed).
-- ============================================================================
alter table public.orders add column if not exists cancel_requested_at timestamptz;
alter table public.orders add column if not exists refund_status       text;
alter table public.orders add column if not exists refund_note         text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_refund_status_check') then
    alter table public.orders
      add constraint orders_refund_status_check check (refund_status in ('queued', 'processed', 'failed'));
  end if;
end $$;
