// WhatsApp number helpers (used in the admin form and on public pages).

/** "0803 123 4567", "+234 803 123 4567" and "2348031234567" all become "2348031234567". */
export function normalizeWhatsapp(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "234" + digits.slice(1); // Nigerian local format
  return digits;
}

export const isValidWhatsapp = (digits: string) => /^\d{10,15}$/.test(digits);

export function whatsappLink(number: string, text?: string) {
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
