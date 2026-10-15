import Link from "next/link";
import { MapPin, MessageCircle, Phone, FileText } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

export default function QuickContactBar({
  whatsapp,
  phone,
  zones,
  pickupEnabled,
}: {
  whatsapp: string | null;
  phone: string | null;
  zones: string[];
  pickupEnabled: boolean;
}) {
  const shown = zones.slice(0, 5);
  return (
    <section aria-labelledby="quick-heading" className="bg-kb-mist">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <h2 id="quick-heading" className="sr-only">Order and contact</h2>
        <ul className="grid gap-5 md:grid-cols-3">
          <li className="card flex gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-kb-green text-white">
              <MessageCircle size={24} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-bold text-kb-forest">Order or ask on WhatsApp</h3>
              <p className="mt-1 text-sm text-kb-charcoal/70">Chat with us about products, prices and delivery.</p>
              {whatsapp ? (
                <a
                  href={whatsappLink(whatsapp, "Hello KingBoostFarms, I would like to place an order / make an enquiry.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-kb-green hover:underline"
                >
                  Start a chat →
                </a>
              ) : (
                <Link href="/contact" className="mt-3 inline-block text-sm font-semibold text-kb-green hover:underline">Send us a message →</Link>
              )}
              {phone && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-kb-charcoal/70">
                  <Phone size={14} aria-hidden="true" />
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-kb-green hover:underline">{phone}</a>
                </p>
              )}
            </div>
          </li>

          <li className="card flex gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-kb-forest text-kb-gold">
              <MapPin size={24} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-bold text-kb-forest">Delivery and pickup</h3>
              {shown.length > 0 ? (
                <p className="mt-1 text-sm text-kb-charcoal/70">
                  We deliver to {shown.join(", ")}
                  {zones.length > shown.length ? " and more areas" : ""}.
                  {pickupEnabled ? " Self pickup is available too." : ""}
                </p>
              ) : (
                <p className="mt-1 text-sm text-kb-charcoal/70">Delivery areas and fees are shown at checkout.</p>
              )}
              <Link href="/delivery-and-refunds" className="mt-3 inline-block text-sm font-semibold text-kb-green hover:underline">
                Delivery &amp; refund details →
              </Link>
            </div>
          </li>

          <li className="card flex gap-4 p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-kb-gold text-kb-forest">
              <FileText size={24} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-bold text-kb-forest">Business or bulk orders</h3>
              <p className="mt-1 text-sm text-kb-charcoal/70">Buying for a shop, restaurant or event? Tell us what you need and we will send a quote.</p>
              <Link href="/request-quote" className="mt-3 inline-block text-sm font-semibold text-kb-green hover:underline">
                Request a bulk quote →
              </Link>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
