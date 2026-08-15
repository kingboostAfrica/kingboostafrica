import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Farmer } from "@/lib/types";
import FarmerCard from "@/components/FarmerCard";

export const metadata = { title: "Farmer Directory — KingBoostAfrica" };

export default async function FarmersPage() {
  const supabase = await createClient();
  const { data: farmers } = await supabase
    .from("farmers")
    .select("*")
    .order("verified", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink">
            Farmer Directory
          </h1>
          <p className="text-ink/60 mt-2">
            Meet the farmers behind the produce — verified members of the
            KingBoostAfrica cooperative.
          </p>
        </div>
        <Link
          href="/farmers/register"
          className="text-sm font-medium px-5 py-2.5 bg-clay text-millet rounded-full hover:bg-clay-dark transition-colors whitespace-nowrap"
        >
          Register as a Farmer
        </Link>
      </div>

      {farmers && farmers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(farmers as Farmer[]).map((farmer) => (
            <FarmerCard key={farmer.id} farmer={farmer} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-sage rounded-2xl">
          <p className="text-ink/60">
            No farmers registered yet.{" "}
            <Link href="/farmers/register" className="text-clay underline">
              Be the first
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
