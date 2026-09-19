# Design update (v3) — what to upload

This is a visual redesign on top of v2 (security + admin). No database changes:
if you already ran `002_hardening_and_admin.sql`, don't run anything new.

## If v2 is already on GitHub
1. Upload every file in this folder (49 files, same folder structure). Say "replace" when asked.
2. Optional clean-up — delete these unused leftovers from `public/`:
   file.svg, globe.svg, next.svg, vercel.svg, window.svg
3. Netlify redeploys on its own.

## If v2 is NOT on GitHub yet
Use `kingboostafrica-main-v3.zip` instead (whole project) and follow the delete-old-files
list in its `UPGRADE.md`.

## What changed
- New logo files: smooth edges, dark + light versions, wordmark, share image, app icons.
- New header (utility bar + logo lockup + full nav), footer, page banners, breadcrumbs.
- Homepage, Food Mart, Gallery, Academy, Consulting, About, Contact, Cart, Checkout redesigned.
- Headings use the Lora serif (matches the logo wordmark); body text is still Open Sans.
- Public header/footer are hidden inside /admin; admin has its own green bar.

## After the deploy, check
1. Headings show in a serif font (Lora loads from Google Fonts).
2. Logo in the header is crisp; footer logo is white/gold on green.
3. Site Content > Home > hero: upload a photo in "image_url" if you want a real photo instead of the field artwork.
