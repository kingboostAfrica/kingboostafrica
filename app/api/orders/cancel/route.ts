import { NextResponse } from "next/server";
import { cancelOrderByToken, isToken } from "@/lib/order-cancel";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = body?.token;
  if (!isToken(token)) {
    return NextResponse.json({ state: "not_found" }, { status: 404 });
  }
  const state = await cancelOrderByToken(token);
  const status = state === "not_found" ? 404 : state === "not_allowed" ? 409 : 200;
  return NextResponse.json({ state }, { status });
}
