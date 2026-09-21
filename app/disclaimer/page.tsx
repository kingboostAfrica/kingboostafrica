import Link from "next/link";
import PolicyLayout, { Note, P, UL, type PolicySection } from "@/components/PolicyLayout";

export const metadata = {
  title: "Disclaimer — KingBoostFarms",
  description: "Important information about the products, courses, advice and content on the KingBoostFarms website.",
};

const sections: PolicySection[] = [
  {
    id: "general",
    title: "General information",
    body: (
      <P>
        The information on this website is provided in good faith by KingBoost Farms Ltd. for general purposes. We work
        to keep it accurate and up to date, but we make no promise that it is always complete, current or free of errors.
        Please use your own judgment, and contact us if something is unclear.
      </P>
    ),
  },
  {
    id: "products",
    title: "Products and pictures",
    body: (
      <UL>
        <li>
          Pictures are for illustration. Fresh and natural products vary in size, shape, colour and appearance from one
          batch to the next.
        </li>
        <li>Weights, sizes and quantities are approximate unless we say otherwise.</li>
        <li>
          Availability, stock levels and prices can change without notice. If a price is shown in error, we may correct it
          and give you the option to proceed or cancel before we confirm your order.
        </li>
        <li>
          Please check the product page and your order before you pay, and contact us if you are unsure about anything.
        </li>
      </UL>
    ),
  },
  {
    id: "allergies",
    title: "Allergies, dietary needs and health",
    body: (
      <>
        <P>
          If you have an allergy, a medical condition or a special dietary need, please contact us before you order so we
          can tell you what we know about a product. Products may be handled or stored near other foods.
        </P>
        <P>
          Nothing on this site is medical or nutritional advice. Talk to a qualified professional about your health.
        </P>
      </>
    ),
  },
  {
    id: "training",
    title: "Academy and consulting",
    body: (
      <>
        <P>
          Our Academy courses and consulting services share knowledge and experience to help farms and agribusinesses do
          better. Results depend on many things outside our control, such as weather, markets, inputs, management and
          local conditions.
        </P>
        <P>
          We therefore do not guarantee particular outcomes, such as yields, profits, growth, funding or certification.
          Examples, figures and case descriptions are illustrations, not promises. What is included in a course or service,
          and its price and dates, are confirmed with you directly before you commit.
        </P>
      </>
    ),
  },
  {
    id: "advice",
    title: "Agritech and organics content",
    body: (
      <P>
        Content about technology, farming methods and organic practices is general guidance only. It is not a substitute
        for professional agronomic, legal, financial or regulatory advice. Organic status and certification are decided by
        the relevant certifying bodies against their own standards, so please check those requirements before you rely on
        any claim.
      </P>
    ),
  },
  {
    id: "third",
    title: "Third-party services and links",
    body: (
      <P>
        We use trusted services for payments (Paystack), messaging (WhatsApp) and other functions, and the site links to
        social media pages. We do not control these services or their websites, and we are not responsible for their
        content, availability or practices. Your use of them is under their own terms.
      </P>
    ),
  },
  {
    id: "availability",
    title: "Website availability",
    body: (
      <P>
        We try to keep the website available at all times, but it may occasionally be unavailable because of maintenance,
        technical faults or things outside our control. We are not responsible for any loss caused by the site being
        unavailable for a period.
      </P>
    ),
  },
  {
    id: "ip",
    title: "Ownership of content",
    body: (
      <P>
        The KingBoostFarms name, logo, text, pictures and design belong to KingBoost Farms Ltd. or are used with
        permission. Please do not copy, reproduce or use them for commercial purposes without our written permission.
      </P>
    ),
  },
  {
    id: "liability",
    title: "Limits of our responsibility",
    body: (
      <>
        <P>
          To the fullest extent the law allows, KingBoost Farms Ltd. is not liable for indirect or consequential loss, or
          for loss of profit or opportunity, arising from your use of this website or reliance on its content.
        </P>
        <Note>
          Nothing in this disclaimer excludes or limits any liability that cannot be excluded by law, or your rights as a
          consumer under Nigerian law. Your rights on orders, delivery and refunds are set out in our{" "}
          <Link href="/delivery-and-refunds" className="font-semibold text-kb-green hover:underline">
            Delivery & Refund Policy
          </Link>
          , and how we handle your information is explained in our{" "}
          <Link href="/privacy-policy" className="font-semibold text-kb-green hover:underline">
            Privacy Policy
          </Link>
          .
        </Note>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law and changes",
    body: (
      <P>
        This disclaimer is governed by the laws of the Federal Republic of Nigeria. We may update it from time to time, and
        the date at the side of this page shows the latest version.
      </P>
    ),
  },
];

export default function DisclaimerPage() {
  return (
    <PolicyLayout
      title="Disclaimer"
      description="Important information about the products, courses, advice and content on this website."
      updated="September 2026"
      sections={sections}
    />
  );
}
