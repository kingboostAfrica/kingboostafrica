-- ============================================================================
-- KingBoostFarms — 009: homepage photo slider + CEO profile on the About page
-- Run ONCE in the Supabase SQL editor, after 008. Safe to re-run.
--
--   * gallery_items.featured: tick "Show in homepage slider" on a gallery photo (Admin > Gallery).
--   * page_content gets an About > leader > ceo row for the CEO's photo, name and message.
--     Your current homepage hero photo (the CEO portrait) is copied into it once, so the About page
--     shows it straight away. You can change it any time in Admin > Site content > About.
-- ============================================================================
alter table public.gallery_items add column if not exists featured boolean not null default false;

insert into public.page_content (page, section, key, sort_order, title, body, image_url)
select 'about', 'leader', 'ceo', 0,
       null,
       'Leading KingBoostFarms in its mission to cultivate growth and nourish nations.',
       (select image_url from public.page_content
         where page = 'home' and section = 'hero' and key = 'main' and image_url is not null
         limit 1)
on conflict (page, section, key) do nothing;
