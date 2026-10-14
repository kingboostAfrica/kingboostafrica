import { NextResponse } from "next/server";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { cancelOrderByToken, isToken } from "@/lib/order-cancel";

export async function POST(request: Request) {
  if (!(await rateLimit(request, "cancel", 30, 600))) return tooManyRequests();
  const body = await request.json().catch(() => null);
  const token = body?.token;
  if (!isToken(token)) {
    return NextResponse.json({ state: "not_found" }, { status: 404 });
  }
  const state = await cancelOrderByToken(token);
  const status = state === "not_found" ? 404 : state === "not_allowed" ? 409 : 200;
  return NextResponse.json({ state }, { status });
}
