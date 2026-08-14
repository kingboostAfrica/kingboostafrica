import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink text-millet mt-20">
      <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <p className="font-display text-lg font-semibold mb-2">
            KingBoost<span className="text-clay">Africa</span>
          </p>
          <p className="text-sm text-sage-light/90 max-w-xs">
            Connecting Nigerian farmers directly to buyers — produce, livestock,
            and equipment, sold farmer to table.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3 text-sage-light">Explore</p>
          <ul className="space-y-2 text-sm text-sage-light/90">
            <li><Link href="/shop" className="hover:text-clay">Marketplace</Link></li>
            <li><Link href="/farmers" className="hover:text-clay">Farmer Directory</Link></li>
            <li><Link href="/gallery" className="hover:text-clay">Gallery</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3 text-sage-light">For Farmers</p>
          <ul className="space-y-2 text-sm text-sage-light/90">
            <li><Link href="/farmers/register" className="hover:text-clay">Register to Sell</Link></li>
            <li><Link href="/login" className="hover:text-clay">Farmer Login</Link></li>
            <li><Link href="/contact" className="hover:text-clay">Contact Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sage/20 py-5 text-center text-xs text-sage-light/70">
        © {new Date().getFullYear()} KingBoostAfrica. All rights reserved.
      </div>
    </footer>
  );
}
