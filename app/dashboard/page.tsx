import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Farmer, Product } from "@/lib/types";
import { Package, User, LogOut } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: farmer } = await supabase
    .from("farmers")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("farmer_id", user.id)
    .order("created_at", { ascending: false });

  const f = farmer as Farmer | null;
  const list = (products as Product[] | null) || [];

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Welcome, {f?.full_name?.split(" ")[0] || "Farmer"}
          </h1>
          <p className="text-ink/60 mt-1">Manage your listings and profile.</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <Link
          href="/dashboard/products"
          className="p-6 border border-sage/40 rounded-2xl hover:bg-sage-light/40 transition-colors flex items-center gap-4"
        >
          <Package className="text-clay" size={28} />
          <div>
            <p className="font-medium text-ink">Your Listings</p>
            <p className="text-sm text-ink/60">{list.length} product(s)</p>
          </div>
        </Link>
        <Link
          href="/dashboard/profile"
          className="p-6 border border-sage/40 rounded-2xl hover:bg-sage-light/40 transition-colors flex items-center gap-4"
        >
          <User className="text-clay" size={28} />
          <div>
            <p className="font-medium text-ink">Your Profile</p>
            <p className="text-sm text-ink/60">
              {f?.verified ? "Verified" : "Not yet verified"}
            </p>
          </div>
        </Link>
      </div>

      <Link
        href="/dashboard/products/new"
        className="inline-block bg-clay text-millet px-6 py-3 rounded-full font-medium hover:bg-clay-dark transition-colors"
      >
        + List a New Product
      </Link>
    </div>
  );
}
