import { NextResponse } from "next/server";
import { findOrderToken } from "@/lib/order-tracking";

// Public: looks up an order from its reference number + the email it was placed with.
// Deliberately vague on failure, so this can't be used to check whether an email placed any order.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const ref = typeof body?.ref === "string" ? body.ref : "";
  const email = typeof body?.email === "string" ? body.email : "";

  const token = await findOrderToken(ref, email);
  if (!token) {
    return NextResponse.json(
      { error: "We could not find an order with that reference and email. Please check both and try again." },
      { status: 404 }
    );
  }
  return NextResponse.json({ token });
}
