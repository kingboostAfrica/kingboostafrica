import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-kb-charcoal text-white mt-20">
      <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 sm:grid-cols-4 gap-10">
        <div>
          <p className="font-display text-lg font-bold mb-2">
            KingBoost<span className="text-kb-gold">Farms</span>
          </p>
          <p className="text-sm text-white/70 max-w-xs">
            Growing Value. Nourishing Lives. Pure, natural, nutritious produce
            and agribusiness services across Nigeria.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3 text-kb-gold">Our Verticals</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/food-mart" className="hover:text-kb-gold">Food Mart</Link></li>
            <li><Link href="/academy" className="hover:text-kb-gold">Academy</Link></li>
            <li><Link href="/consulting" className="hover:text-kb-gold">Consulting</Link></li>
            <li><Link href="/agritech" className="hover:text-kb-gold">Agritech</Link></li>
            <li><Link href="/organics" className="hover:text-kb-gold">Organics</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3 text-kb-gold">Company</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/about" className="hover:text-kb-gold">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-kb-gold">Contact Us</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-kb-gold">Privacy Policy</Link></li>
            <li><Link href="/disclaimer" className="hover:text-kb-gold">Disclaimer</Link></li>
            <li><Link href="/admin/login" className="hover:text-kb-gold">Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold mb-3 text-kb-gold">Get in Touch</p>
          <ul className="space-y-2 text-sm text-white/70">
            <li>8 Ibudo Oloja Street, Igbanko, Badagry, Lagos State, Nigeria</li>
            <li><a href="mailto:info@kingboostfarms.com" className="hover:text-kb-gold">info@kingboostfarms.com</a></li>
            <li><a href="https://www.kingboostfarms.com" className="hover:text-kb-gold">www.kingboostfarms.com</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
        © {new Date().getFullYear()} KingBoostFarms. All rights reserved.
      </div>
    </footer>
  );
}
