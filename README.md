# KingBoostFarms

Nigerian agribusiness website: **Food Mart** (shop), **Academy** (courses),
**Consulting** (bookable services), **Agritech** and **Organics** (inquiry pages),
plus an admin panel at `/admin`.

**Stack:** Next.js 16 (App Router, TypeScript, Tailwind 4) · Supabase (Postgres + Auth) ·
Cloudinary (all images) · Netlify (hosting).

## Environment variables

See `.env.example`. The first four are required and are set in Netlify
(Site configuration → Environment variables). The email variables are optional:

- `RESEND_API_KEY` — turns on email alerts (new orders, inquiries, course sign-ups, consulting requests).
- `ORDER_NOTIFY_EMAIL` — where alerts go (default `kingboost.africa@gmail.com`).
- `EMAIL_FROM` — e.g. `KingBoostFarms <orders@kingboostfarms.com.ng>`, needs a domain verified in Resend.
  Setting it also switches on the order confirmation email to customers.

## Database setup (Supabase SQL editor, in this order)

1. The original schema (categories, products, gallery_items, orders, order_items).
2. `supabase/kingboostfarms_migration.sql` — courses, consulting, enrollments, inquiries.
3. `supabase/002_hardening_and_admin.sql` — **security + admin tooling** (safe to re-run):
   - admin-only Row Level Security (a random Supabase signup can no longer read
     orders/messages or edit products),
   - `place_order()` — checkout validates prices and stock on the server and
     decrements stock atomically,
   - cancelling an order puts its stock back,
   - creates `page_content` and seeds the default text so **Site Content** is editable.

Then, in Supabase → Authentication → Sign In / Providers, **turn off "Allow new users to sign up"**
(there is only one admin; add the admin user manually and make sure their id is in the `admins` table).

## Admin panel (`/admin`)

| Section | What you can do |
|---|---|
| Orders | See every order, contact the buyer (call / WhatsApp), change status. Cancelling restores stock. |
| Products | Add, edit, hide/show, delete. |
| Categories | Create the categories used by Food Mart and Gallery. |
| Courses / Consulting | Add, edit, hide/show, delete. |
| Gallery | Upload several photos at once, assign a category, delete. |
| Site Content | Edit the text on Home, About, Agritech, Organics. |
| Messages & Sign-ups | Inquiries, course enrollments, consulting bookings — mark them handled. |

## How checkout works

The browser sends only *which products* and *how many*. The `place_order()` database
function looks up the real prices, checks stock, creates the order and decrements stock in one
transaction. Payment is currently **pay on delivery**. Paystack/Flutterwave plugs in at
`app/api/checkout/route.ts` (create order as `pending` → start payment → mark `paid` from a webhook).

## Project layout

```
app/                    public pages + API routes
app/admin/login         login (public)
app/admin/(panel)/...   everything else in the admin — guarded by requireAdmin()
components/admin/       admin forms and controls
lib/supabase/           browser / server / session clients
proxy.ts                refreshes the auth cookie (Next 16 name for "middleware")
supabase/               SQL to run in the Supabase SQL editor
```

## Scripts

`npm run dev` · `npm run build` · `npm run lint`
(`--webpack` is set on dev/build on purpose.)
