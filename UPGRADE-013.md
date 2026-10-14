# Upgrade 013 — customer accounts, wishlist, reviews, related products, spam protection

Do the steps in this order. Nothing here touches Paystack, so it is safe while Paystack is still in test mode.

## 1. Database (Supabase → SQL Editor)
Run `supabase/013_accounts_wishlist_reviews.sql` once. It is safe to re-run.
Run it BEFORE pushing the new code (the product pages read the new review view).

## 2. Supabase login settings (Authentication)
1. **Sign In / Providers → Email**: turn "Allow new users to sign up" back **ON**
   (002 told you to turn it off; customers now need it. Admin access is NOT affected:
   it is still decided only by the `admins` table).
2. Same page: keep **"Confirm email" ON**. This is important: order history and reviews are
   matched on a *confirmed* email, so nobody can read someone else's orders by signing up with their address.
3. **URL Configuration**: set Site URL to `https://kingboostfarms.com.ng` and add
   `https://kingboostfarms.com.ng/auth/callback` to Redirect URLs.
4. **Emails → SMTP Settings**: switch on custom SMTP using Resend
   (host `smtp.resend.com`, port `465`, username `resend`, password = your Resend API key,
   sender e.g. `KingBoostFarms <accounts@kingboostfarms.com.ng>`).
   Supabase's built-in email sender only allows a handful of emails per hour, which would
   block customers from signing up.

## 3. Deploy (Codespaces terminal)
    git add -A
    git commit -m "Add customer accounts, wishlist, reviews, related products, rate limiting, security headers"
    git push

## 4. Test (after Netlify finishes)
- Create a customer account with a real email, click the confirmation link, log in.
- Hover a product card: the heart should save it; check My account → Wishlist.
- Place an order with that email, mark it Paid in Admin → Orders, then open the product,
  submit a review, and approve it in Admin → Product reviews.
- Log in as a second customer who never bought it: the review box should say only buyers can review.

## What is new
- `/account` (orders, reorder, saved details), `/account/wishlist`, `/account/login|signup|forgot`
- Checkout fills in saved details for logged-in customers
- Product page: reviews + star rating (also shown to Google), heart button, "You may also like"
- Admin → Product reviews (approve / reject / delete) and a dashboard alert for waiting reviews
- Rate limiting on checkout, contact, quote, enrollment, booking, order lookup/cancel and reviews
- Security headers on every page

## Files in this update
Unzip over your project (same folder structure). package.json and package-lock.json are NOT included: they are already up to date from the last deploy.

### New files
- supabase/013_accounts_wishlist_reviews.sql
- lib/rate-limit.ts, lib/safe-redirect.ts, lib/wishlist-context.tsx
- components/WishlistButton.tsx
- components/account/ (AuthForm, AccountTabs, AccountLogout, ProfileForm, ReorderButton, UpdatePasswordForm)
- components/reviews/ (Stars, ProductReviews, ReviewForm)
- components/admin/ReviewModeration.tsx
- app/account/ (page, wishlist, login, signup, forgot, update-password)
- app/auth/callback/route.ts
- app/api/reviews/route.ts
- app/admin/(panel)/reviews/page.tsx
- UPGRADE-013.md

### Changed files
- app/layout.tsx (wishlist provider)
- app/products/[slug]/page.tsx (reviews, heart, related products, star data for Google)
- app/admin/(panel)/page.tsx (reviews tile + alert)
- app/api/checkout, inquiries, quote-requests, enrollments, consulting-bookings, orders/cancel, orders/find-token (rate limiting)
- app/robots.ts (keeps /account out of Google)
- components/CheckoutClient.tsx (fills in saved details), Navbar.tsx (account icon), ProductCard.tsx (heart)
- next.config.ts (security headers), proxy.ts (keeps customer logins fresh)
