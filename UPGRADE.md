# Upgrade notes (read once, then you can delete this file)

## 1. Database first (Supabase → SQL Editor)

Run `supabase/002_hardening_and_admin.sql`. It is safe to re-run.
Do this **before** the new code goes live: the new checkout calls `place_order()`.
(Between running the SQL and deploying, the *old* checkout will fail — that's expected and short.)

Then Supabase → Authentication → Sign In / Providers → turn **off** "Allow new users to sign up".

## 2. Delete these OLD files/folders from the GitHub repo first

They were moved or renamed. Leaving them in place makes the build fail
("two pages resolve to the same path").

- `middleware.ts`                      (replaced by `proxy.ts`)
- `lib/supabase/middleware.ts`         (renamed `lib/supabase/session.ts`)
- `app/admin/layout.tsx`               (moved to `app/admin/(panel)/layout.tsx`)
- `app/admin/page.tsx`                 (moved to `app/admin/(panel)/page.tsx`)
- `app/admin/consulting/`  (whole folder)
- `app/admin/content/`     (whole folder)
- `app/admin/courses/`     (whole folder)
- `app/admin/messages/`    (whole folder)
- `app/admin/products/`    (whole folder)

Keep `app/admin/login/` — it stays where it is (it was edited).

## 3. Upload the new project files

Add file → Upload files → drag in the contents of this folder (GitHub keeps the folder structure).
Netlify redeploys automatically.

## 4. Cloudinary (2 minutes, recommended)

Your unsigned upload preset name + cloud name are public by design. In Cloudinary → Settings →
Upload → your preset: limit allowed formats to jpg/png/webp, set a maximum file size, and set a folder.
That stops anyone abusing the preset to fill your storage.

## 5. Smoke test after deploy

1. `/admin/login` opens (no redirect loop) → log in → dashboard shows Orders, Categories, Gallery.
2. Categories → add "Grains" (Food Mart) and one Gallery category.
3. Products → add a product with stock 5 → open it on Food Mart → add to cart → checkout.
4. Orders → the order appears; stock on the product dropped. Cancel it → stock returns.
5. Gallery → upload two photos → they appear on `/gallery`.
6. Site Content → Home → edit the hero title → Save → refresh `/`.
