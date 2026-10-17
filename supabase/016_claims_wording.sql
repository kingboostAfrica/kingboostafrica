-- ============================================================================
-- KingBoostFarms — 016: honest wording for organic / natural / preservative claims
-- Run ONCE in the Supabase SQL editor, after 015. Safe to re-run.
--
-- Each line changes a saved text ONLY while it still has the original wording, so anything
-- you have already edited yourself in Admin > Site content is left exactly as you wrote it.
-- ============================================================================

-- Home page: "why choose" points
update public.page_content set title = 'Natural ingredients', body = 'Simple, natural food made from the crops we grow and source.'
  where page = 'home' and section = 'why' and key = 'why-1'
    and title = '100% natural' and body = 'Pure, natural food made from the crops we grow and source.';
update public.page_content set title = 'No added preservatives'
  where page = 'home' and section = 'why' and key = 'why-2' and title = 'No preservatives';

-- Organics wording: no "certified" claim until a certificate is held
update public.page_content set body = 'Organic and natural farming solutions'
  where page = 'home' and section = 'vertical' and key = 'organics' and body = 'Certified organic solutions';
update public.page_content set body = 'Organic inputs and naturally grown produce for a healthier food system.'
  where page = 'about' and section = 'vertical' and key = 'organics' and body = 'Certified organic inputs and produce for a healthier food system.';
update public.page_content set
    title = 'Organic and natural farming solutions',
    body  = 'KingBoostFarms Organics supports growers and buyers who want to farm and eat with fewer synthetic chemicals — from organic inputs and certification guidance to sourcing naturally grown produce.'
  where page = 'organics' and section = 'intro' and key = 'main'
    and title = 'Certified organic solutions'
    and body  = 'KingBoostFarms Organics supports growers and buyers who want food and farming free of synthetic chemicals — from inputs and certification to sourcing certified organic produce.';
update public.page_content set title = 'Organic Inputs'
  where page = 'organics' and section = 'offering' and key = 'offering-1' and title = 'Certified Organic Inputs';
update public.page_content set body = 'Sourcing and supply of naturally grown crops for retail and food service.'
  where page = 'organics' and section = 'offering' and key = 'offering-3'
    and body = 'Sourcing and supply of certified organic crops for retail and food service.';
