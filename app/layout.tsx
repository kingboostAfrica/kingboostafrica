import type { Metadata } from "next";
import { Lora, Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HideOnAdmin from "@/components/HideOnAdmin";
import { CartProvider } from "@/lib/cart-context";
import { SITE_URL } from "@/lib/site";

// Lora matches the serif wordmark in the KingBoost logo.
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-opensans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "KingBoostFarms — Growing Value. Nourishing Lives.",
  openGraph: {
    type: "website",
    siteName: "KingBoostFarms",
    locale: "en_NG",
    images: ["/og-image.png"],
  },
  description:
    "KingBoostFarms is a Nigerian agribusiness spanning Food Mart, Academy, Consulting, Agritech, and Organics — pure, natural, nutritious produce and services rooted in sustainable farming.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lora.variable} ${openSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-kb-charcoal">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <HideOnAdmin>
            <Footer />
          </HideOnAdmin>
        </CartProvider>
      </body>
    </html>
  );
}
