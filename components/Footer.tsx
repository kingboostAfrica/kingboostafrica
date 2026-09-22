import Image from "next/image";
import { MapPin, Mail, Globe, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";
import SocialIcons from "@/components/SocialIcons";
import ScrollTopLink, { ScrollAfterNavigation } from "@/components/ScrollTopLink";
import BackToTop from "@/components/BackToTop";
import type { SocialLink } from "@/lib/social";
import { FieldLines } from "@/components/FieldArt";

const verticals = [
  { href: "/food-mart", label: "Food Mart" },
  { href: "/academy", label: "Academy" },
  { href: "/consulting", label: "Consulting" },
  { href: "/agritech", label: "Agritech" },
  { href: "/organics", label: "Organics" },
];

const company = [
  { href: "/about", label: "About us" },
  { href: "/gallery", label: "Gallery" },
  { href: "/track-order", label: "Track my order" },
  { href: "/contact", label: "Contact us" },
  { href: "/delivery-and-refunds", label: "Delivery & refunds" },
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/disclaimer", label: "Disclaimer" },
];

const linkCls = "text-white/70 transition-colors hover:text-kb-gold";

export default function Footer({ whatsapp, social = [] }: { whatsapp?: string | null; social?: SocialLink[] }) {
  return (
    <footer className="relative overflow-hidden bg-kb-forest text-white print:hidden">
      <ScrollAfterNavigation />
      <div className="h-1 bg-kb-gold" aria-hidden="true" />
      <FieldLines className="pointer-events-none absolute inset-y-0 right-0 h-full w-full opacity-60 lg:w-2/3" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <ScrollTopLink href="/" ariaLabel="KingBoostFarms home" className="inline-block">
            <Image
              src="/kingboost-full-light.png"
              alt="KingBoost Farms Ltd. — Cultivating Growth, Nourishing Nations"
              width={775}
              height={654}
              className="h-auto w-44"
            />
          </ScrollTopLink>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">
            Pure, natural, nutritious produce and agribusiness services across Nigeria.
          </p>
          {(social.length > 0 || whatsapp) && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-white">Follow us</p>
              <SocialIcons links={social} whatsapp={whatsapp} tone="light" />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-base font-bold text-white">Our verticals</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {verticals.map((l) => (
              <li key={l.href}>
                <ScrollTopLink href={l.href} className={linkCls}>
                  {l.label}
                </ScrollTopLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-white">Company</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {company.map((l) => (
              <li key={l.href}>
                <ScrollTopLink href={l.href} className={linkCls}>
                  {l.label}
                </ScrollTopLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-white">Get in touch</h2>
          <ul className="mt-4 space-y-3.5 text-sm text-white/70">
            <li className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-kb-gold" aria-hidden="true" />
              <span>8 Ibudo Oloja Street, Igbanko, Badagry, Lagos State, Nigeria</span>
            </li>
            <li className="flex gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-kb-gold" aria-hidden="true" />
              <a href="mailto:kingboost.africa@gmail.com" className={linkCls}>
                kingboost.africa@gmail.com
              </a>
            </li>
            {whatsapp && (
              <li className="flex gap-3">
                <MessageCircle size={18} className="mt-0.5 shrink-0 text-kb-gold" aria-hidden="true" />
                <a href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer" className={linkCls}>
                  Chat on WhatsApp
                </a>
              </li>
            )}
            <li className="flex gap-3">
              <Globe size={18} className="mt-0.5 shrink-0 text-kb-gold" aria-hidden="true" />
              <ScrollTopLink href="/" className={linkCls}>
                kingboostfarms.com.ng
              </ScrollTopLink>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-white/55">
          <p>© {new Date().getFullYear()} KingBoost Farms Ltd. All rights reserved.</p>
          <p className="font-display italic">Cultivating Growth, Nourishing Nations</p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
