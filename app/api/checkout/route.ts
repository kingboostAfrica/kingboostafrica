import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clean, isEmail } from "@/lib/validation";

// Places an order through the database function `place_order()`
// (see supabase/002_hardening_and_admin.sql).
//
// IMPORTANT: the browser only sends WHICH products and HOW MANY. Prices and
// stock are looked up and checked inside the database, so a customer can't
// change a price by editing the request.
//
// Payment gateway (Paystack/Flutterwave) hooks in here later: create the
// order as "pending", start the payment, then mark it "paid" from a webhook.
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const buyerName = clean(body.buyerName, 200);
    const buyerEmail = clean(body.buyerEmail, 320);
    const buyerPhone = clean(body.buyerPhone, 40);
    const deliveryAddress = clean(body.deliveryAddress, 1000);

    if (!buyerName || !isEmail(buyerEmail) || !deliveryAddress) {
      return NextResponse.json(
        { error: "Please fill in your name, a valid email, and delivery address." },
        { status: 400 }
      );
    }

    const rawItems: unknown = body.items;
    if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const items = rawItems.map((i: { product?: { id?: unknown }; quantity?: unknown }) => ({
      product_id: i?.product?.id,
      quantity: Number(i?.quantity),
    }));

    if (
      items.some(
        (i) =>
          typeof i.product_id !== "string" ||
          !Number.isInteger(i.quantity) ||
          i.quantity < 1 ||
          i.quantity > 1000
      )
    ) {
      return NextResponse.json({ error: "Your cart has an invalid item." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("place_order", {
      p_name: buyerName,
      p_email: buyerEmail,
      p_phone: buyerPhone,
      p_address: deliveryAddress,
      p_items: items,
    });

    if (error) {
      // Messages raised on purpose inside place_order() are safe to show
      // (stock / availability). Anything else is logged and hidden.
      const friendly =
        /left in stock|no longer available|Invalid quantity|cart is empty/i.test(error.message);
      if (friendly) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      throw error;
    }

    const result = data as { order_id: string; total: number };
    return NextResponse.json({ orderId: result.order_id, total: result.total });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Something went wrong placing your order. Please try again." },
      { status: 500 }
    );
  }
}
