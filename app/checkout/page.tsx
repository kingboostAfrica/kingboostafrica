import CheckoutClient from "@/components/CheckoutClient";
import { paystackEnabled } from "@/lib/paystack";

export const metadata = { title: "Checkout — KingBoostFarms" };
// Read the Paystack setting on every request (not at build time).
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return <CheckoutClient paystackEnabled={paystackEnabled()} />;
}
