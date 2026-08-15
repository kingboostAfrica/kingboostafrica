import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Phone, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Farmer, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

export default async function FarmerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: farmer } = await supabase
    .from("farmers")
    .select("*")
    .eq("id", id)
    .single();

  if (!farmer) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("farmer_id", id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const f = farmer as Farmer;

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center border-b border-sage/40 pb-10 mb-10">
        <div className="w-24 h-24 rounded-full bg-sage-light overflow-hidden relative shrink-0">
          {f.photo_url ? (
            <Image src={f.photo_url} alt={f.full_name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sage font-display text-3xl">
              {f.full_name.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink flex items-center gap-2">
            {f.full_name}
            {f.verified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-cassava bg-cassava/10 px-2 py-1 rounded-full">
                <ShieldCheck size={13} /> Verified Cooperative Member
              </span>
            )}
          </h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-ink/60">
            {f.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {f.location}
                {f.state ? `, ${f.state}` : ""}
              </span>
            )}
            {f.phone && (
              <span className="flex items-center gap-1">
                <Phone size={14} /> {f.phone}
              </span>
            )}
          </div>
          {f.bio && <p className="text-ink/70 mt-3 max-w-lg">{f.bio}</p>}
        </div>
      </div>

      <h2 className="font-display text-2xl font-semibold text-ink mb-6">
        Listings from {f.full_name.split(" ")[0]}
      </h2>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={{ ...product, farmer: f }} />
          ))}
        </div>
      ) : (
        <p className="text-ink/60">No active listings right now.</p>
      )}
    </div>
  );
}
