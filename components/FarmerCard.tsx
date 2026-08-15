import Link from "next/link";
import Image from "next/image";
import { MapPin, ShieldCheck } from "lucide-react";
import type { Farmer } from "@/lib/types";

export default function FarmerCard({ farmer }: { farmer: Farmer }) {
  return (
    <Link
      href={`/farmers/${farmer.id}`}
      className="block p-5 rounded-2xl border border-sage/40 bg-white/40 hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-sage-light overflow-hidden relative shrink-0">
          {farmer.photo_url ? (
            <Image src={farmer.photo_url} alt={farmer.full_name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sage font-display text-lg">
              {farmer.full_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-ink truncate flex items-center gap-1.5">
            {farmer.full_name}
            {farmer.verified && (
              <span
                title="Verified cooperative member"
                className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-cassava bg-cassava/10 px-1.5 py-0.5 rounded-full"
              >
                <ShieldCheck size={11} /> Verified
              </span>
            )}
          </p>
          {farmer.location && (
            <p className="text-xs text-ink/50 mt-1 flex items-center gap-1">
              <MapPin size={12} /> {farmer.location}
              {farmer.state ? `, ${farmer.state}` : ""}
            </p>
          )}
        </div>
      </div>
      {farmer.bio && (
        <p className="text-sm text-ink/60 mt-4 line-clamp-2">{farmer.bio}</p>
      )}
    </Link>
  );
}
