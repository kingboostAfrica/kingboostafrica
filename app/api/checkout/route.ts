import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/lib/types";

// Creates an order + order_items in Supabase.
// Payment gateway (Paystack/Flutterwave) integration hooks in here later —
// for now this records the order as "pending".
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buyerName, buyerEmail, buyerPhone, deliveryAddress, items } = body as {
      buyerName: string;
      buyerEmail: string;
      buyerPhone: string;
      deliveryAddress: string;
      items: CartItem[];
    };

    if (!buyerName || !buyerEmail || !items?.length) {
      return NextResponse.json(
        { error: "Missing required checkout fields." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const totalAmount = items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone || null,
        delivery_address: deliveryAddress || null,
        total_amount: totalAmount,
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      throw orderError || new Error("Failed to create order.");
    }

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      farmer_id: i.product.farmer_id,
      quantity: i.quantity,
      unit_price: i.product.price,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Something went wrong placing your order. Please try again." },
      { status: 500 }
    );
  }
}
