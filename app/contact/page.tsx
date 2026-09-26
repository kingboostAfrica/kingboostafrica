import { Mail, MapPin, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import { getContactInfo } from "@/lib/store-settings";

export const metadata = {
  title: "Contact us — KingBoostFarms",
  description: "Questions about Food Mart, Academy, Consulting, Agritech, or Organics? Reach out to KingBoostFarms.",
};

export default async function ContactPage() {
  const contact = await getContactInfo();

  return (
    <>
      <PageHeader
        title="Contact us"
        description="Questions about Food Mart, Academy, Consulting, Agritech, or Organics? Reach out and our team will get back to you."
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <a
            href={contact.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-4 rounded-lg transition-colors hover:bg-kb-mist"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-kb-forest text-kb-gold">
              <MapPin size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-kb-forest">Visit us</p>
              <p className="mt-1 text-kb-charcoal/70">{contact.address}</p>
              <p className="mt-1 text-sm font-semibold text-kb-green">Open in Google Maps →</p>
            </div>
          </a>
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="flex gap-4 rounded-lg transition-colors hover:bg-kb-mist">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-kb-forest text-kb-gold">
                <Phone size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold text-kb-forest">Call us</p>
                <p className="mt-1 text-kb-charcoal/70">{contact.phone}</p>
              </div>
            </a>
          )}
          <div className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-kb-forest text-kb-gold">
              <Mail size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="font-bold text-kb-forest">Email us</p>
              <a href="mailto:kingboost.africa@gmail.com" className="mt-1 block text-kb-charcoal/70 hover:text-kb-green">
                kingboost.africa@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <h2 className="mb-5 text-2xl font-bold text-kb-forest">Send us a message</h2>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
