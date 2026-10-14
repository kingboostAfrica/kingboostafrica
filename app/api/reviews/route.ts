import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clean } from "@/lib/validation";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

// A logged-in customer posts a review. The database itself (supabase/013) only accepts it when they
// have really bought the product, and it starts as "pending" until you approve it in Admin > Reviews.
export async function POST(request: Request) {
  if (!(await rateLimit(request, "reviews", 10, 3600))) return tooManyRequests();

  const body = await request.json().catch(() => null);
  const productId = clean(body?.productId, 64);
  const rating = Number(body?.rating);
  const title = clean(body?.title, 120);
  const text = clean(body?.body, 2000);

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please choose a rating from 1 to 5 stars." }, { status: 400 });
  }
  if (!title && !text) {
    return NextResponse.json({ error: "Please write a few words about the product." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in to leave a review." }, { status: 401 });

  // Show "Ada O." rather than a full name or email.
  const { data: profile } = await supabase.from("customer_profiles").select("full_name").eq("user_id", user.id).maybeSingle();
  const metaName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const fullName = (profile?.full_name || metaName || "").trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  const reviewerName =
    parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0] || "Customer";

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    reviewer_name: reviewerName.slice(0, 60),
    rating,
    title: title || null,
    body: text || null,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "You have already reviewed this product." }, { status: 409 });
    }
    if (error.code === "42501") {
      return NextResponse.json(
        { error: "Only customers who have bought this product can review it." },
        { status: 403 }
      );
    }
    console.error("Review insert error:", error);
    return NextResponse.json({ error: "Could not save your review. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
