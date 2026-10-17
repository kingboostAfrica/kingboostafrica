-- ============================================================================
-- KingBoostFarms — 015: two-step login (authenticator app) for admin and staff
-- Run ONCE in the Supabase SQL editor, after 014. Safe to re-run.
--
-- It is OPT-IN per person. Someone who has NOT turned on two-step login in
-- Admin > Account keeps logging in exactly as before. Someone who HAS turned it on
-- must also give the 6-digit code, and the database itself refuses admin data to a
-- session that has only passed the password step. So a stolen password alone is not enough.
-- ============================================================================

-- True when the logged-in user either has no two-step login set up, or has completed it
-- in this session (the Supabase session is then "aal2").
create or replace function public.mfa_ok()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      or not exists (
        select 1 from auth.mfa_factors f
        where f.user_id = auth.uid() and f.status = 'verified'
      );
$$;
revoke all on function public.mfa_ok() from public;
grant execute on function public.mfa_ok() to anon, authenticated;

-- Same meaning as before (full admin / any staff member), plus the two-step check.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where id = auth.uid() and role = 'admin')
     and public.mfa_ok();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where id = auth.uid())
     and public.mfa_ok();
$$;
