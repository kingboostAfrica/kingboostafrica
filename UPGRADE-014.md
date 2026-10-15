# Update 014 — richer home page

## 1. Database (Supabase → SQL Editor)
Run `supabase/014_home_page_sections.sql` once (safe to re-run). Run it BEFORE pushing the code.
It adds Farm updates, a best-sellers ranking (no sales numbers are exposed) and the editable
"Why choose" and "Farm to table" texts.

## 2. Unzip over your project in Codespaces, then
    unzip -o kingboost-update-014.zip
    rm kingboost-update-014.zip
    npx tsc --noEmit
    git add -A
    git commit -m "Richer home page: shop, why choose, process, courses, reviews, updates, quick contact"
    git push

## 3. What changed on the home page (top to bottom)
1. Hero + benefits strip (unchanged)
2. How we serve agriculture (unchanged)
3. Shop: up to 8 products with category chips and an Add to cart button on each.
   Shows "Our best sellers" once at least 4 products have paid/shipped/completed sales; until then "Fresh from the Food Mart".
4. NEW Why choose KingBoost Foodmart (4 points taken from your packaging: 100% natural, no preservatives, hygienically processed, premium quality)
5. NEW From our farm to your table (grow, process, package, deliver; add a photo to each step in Admin)
6. NEW Learn and get expert advice (latest 2 Academy courses + 2 Consulting services; hidden if none are published)
7. NEW What our customers say (up to 3 approved 4-5 star reviews; hidden until there are some)
8. NEW Latest from the farm (latest 3 updates; hidden until you post one) + a full /updates page
9. NEW Order and contact bar: WhatsApp, delivery areas/pickup, bulk quote
10. What we stand for + closing call to action (unchanged)

## 4. Where to edit things
- Admin → Site content → Home Page: the "why" and "process" wording, icons and step photos.
- Admin → Farm updates (new tile on the dashboard): post, hide or delete updates.
- Admin → Product reviews: approve reviews so they can appear on the home page.
- WhatsApp number, phone and delivery areas come from Admin → Settings.

## Files
New: supabase/014_home_page_sections.sql, lib/icons.tsx, components/home/ (WhyChoose, ProcessSection,
LearnAndAdvise, HomeReviews, FarmUpdates, QuickContactBar), components/admin/FarmUpdatesManager.tsx,
app/updates/page.tsx, app/admin/(panel)/updates/page.tsx
Changed: app/page.tsx, components/ProductCard.tsx, components/admin/ContentEditor.tsx,
app/admin/(panel)/page.tsx, app/sitemap.ts
