import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

// Floating "Chat with us" button (only rendered when a WhatsApp number is set in Admin > Settings).
export default function WhatsAppButton({ number }: { number: string }) {
  return (
    <a
      href={whatsappLink(number, "Hello KingBoostFarms, I have a question.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 print:hidden z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle size={22} aria-hidden="true" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
