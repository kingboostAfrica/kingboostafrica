import CheckoutClient from "@/components/CheckoutClient";
import { paystackEnabled } from "@/lib/paystack";
import { getCheckoutOptions } from "@/lib/store-settings";

export const metadata = { title: "Checkout — KingBoostFarms" };
// Read the payment setting, VAT, pickup and delivery areas on every request (not at build time).
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const options = await getCheckoutOptions();
  return (
    <CheckoutClient
      paystackEnabled={paystackEnabled()}
      vatPercent={options.vatPercent}
      pickup={options.pickup}
      zones={options.zones}
    />
  );
}
