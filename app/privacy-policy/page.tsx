import Link from "next/link";
import PolicyLayout, { Note, P, UL, type PolicySection } from "@/components/PolicyLayout";

export const metadata = {
  title: "Privacy Policy — KingBoostFarms",
  description: "What personal information KingBoostFarms collects, why, who we share it with, and your rights.",
};

const sections: PolicySection[] = [
  {
    id: "who",
    title: "Who we are",
    body: (
      <>
        <P>
          This website is run by <strong>KingBoost Farms Ltd.</strong>, 8 Ibudo Oloja Street, Igbanko, Badagry, Lagos
          State, Nigeria (&ldquo;KingBoostFarms&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). We decide how and why the
          personal information described here is used, which makes us the &ldquo;data controller&rdquo; under the Nigeria
          Data Protection Act 2023 (NDPA).
        </P>
        <P>
          You can reach us about anything in this policy at{" "}
          <a className="font-semibold text-kb-green hover:underline" href="mailto:kingboost.africa@gmail.com">
            kingboost.africa@gmail.com
          </a>
          .
        </P>
      </>
    ),
  },
  {
    id: "collect",
    title: "What information we collect",
    body: (
      <>
        <P>We only collect what we need to serve you. Depending on what you do on the site, that can include:</P>
        <UL>
          <li>
            <strong>When you place an order:</strong> your name, email address, phone number, delivery address (or that
            you chose pickup), the delivery area you selected, the items you bought, the amounts charged and the status of
            your order.
          </li>
          <li>
            <strong>When you contact us or make a request:</strong> your name, email, phone number and message; and, for
            Academy enrolments and consulting requests, the course or service, your company (if you give it) and your
            preferred date.
          </li>
          <li>
            <strong>Payments:</strong> when you pay online, Paystack collects your payment details on its own secure
            page. We receive a payment reference and whether it succeeded, and never see or store your full card number.
          </li>
          <li>
            <strong>Technical data:</strong> like most websites, our hosting provider may log technical details such as
            IP address, browser type and the pages requested, to keep the site running and secure.
          </li>
          <li>
            <strong>Messages on WhatsApp:</strong> if you choose to chat with us on WhatsApp, your messages and phone
            number are handled through WhatsApp under its own terms and privacy policy.
          </li>
        </UL>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use your information",
    body: (
      <>
        <UL>
          <li>to take, prepare, deliver or hand over your order, and to take payment or give refunds;</li>
          <li>
            to email you about your order: confirmation, when it is shipped or ready for pickup, cancellations and
            refunds;
          </li>
          <li>to answer your questions and handle enrolments and consulting requests;</li>
          <li>to prevent fraud and keep the website and our systems secure;</li>
          <li>to keep records we need for accounting, tax and other legal reasons;</li>
          <li>to improve our products, services and website.</li>
        </UL>
        <P>
          We do not sell your personal information. We do not send marketing emails unless you have agreed to receive
          them.
        </P>
      </>
    ),
  },
  {
    id: "basis",
    title: "Our lawful reasons",
    body: (
      <>
        <P>Under the NDPA we may only use your information where we have a lawful reason. Ours are:</P>
        <UL>
          <li>
            <strong>Contract:</strong> we need your details to deliver the order you have placed or to arrange the
            service you asked for;
          </li>
          <li>
            <strong>Legal obligation:</strong> for example keeping financial records;
          </li>
          <li>
            <strong>Legitimate interests:</strong> running and securing our business, and preventing fraud, in ways that
            do not override your rights;
          </li>
          <li>
            <strong>Consent:</strong> where we ask for it, for example before sending marketing. You can withdraw consent
            at any time.
          </li>
        </UL>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <P>
          We share information only with people who help us run the business, and only what they need. We use the
          following types of service provider:
        </P>
        <UL>
          <li>
            <strong>Paystack</strong> to process online payments and refunds;
          </li>
          <li>
            <strong>Supabase</strong> for our database and secure login, where orders and messages are stored;
          </li>
          <li>
            <strong>Netlify</strong> to host the website;
          </li>
          <li>
            <strong>Resend</strong> to send you order and service emails;
          </li>
          <li>
            <strong>Cloudinary</strong> to store and serve the pictures shown on the site;
          </li>
          <li>
            <strong>Delivery staff or partners</strong>, who receive your name, phone number and delivery address so they
            can reach you;
          </li>
          <li>
            <strong>Authorities and advisers</strong>, such as regulators, courts, our accountants or lawyers, where the
            law requires it or we need their advice.
          </li>
        </UL>
        <P>These providers may only use your information to provide their service to us.</P>
      </>
    ),
  },
  {
    id: "transfers",
    title: "Storing information outside Nigeria",
    body: (
      <P>
        Some of our providers process information on servers outside Nigeria. Where that happens, we rely on providers
        that apply appropriate safeguards, and we only transfer information in ways the NDPA allows.
      </P>
    ),
  },
  {
    id: "keep",
    title: "How long we keep it",
    body: (
      <P>
        We keep your information only for as long as we need it for the purposes above. Order and payment records are kept
        for the period needed for accounting, tax and legal purposes. Messages and enquiries are kept while we deal with
        them and for a reasonable time afterwards in case you follow up. After that we delete or anonymise the
        information.
      </P>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <UL>
        <li>The website uses an encrypted (HTTPS) connection.</li>
        <li>Card details go straight to Paystack, not to our servers.</li>
        <li>
          Access to orders and customer messages is limited to authorised team members, and each person has their own
          login with only the access their job needs.
        </li>
        <li>
          If a personal data breach ever affects you and the law requires it, we will notify you and the Nigeria Data
          Protection Commission.
        </li>
      </UL>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <P>Under the NDPA you have the right to:</P>
        <UL>
          <li>ask for a copy of the personal information we hold about you;</li>
          <li>ask us to correct information that is wrong or incomplete;</li>
          <li>ask us to delete your information, in the circumstances the law allows;</li>
          <li>ask us to restrict how we use it, or object to certain uses;</li>
          <li>ask for your information in a portable format;</li>
          <li>withdraw your consent, where we rely on it;</li>
          <li>
            complain to the <strong>Nigeria Data Protection Commission (NDPC)</strong> if you think we have handled
            your information unlawfully.
          </li>
        </UL>
        <P>
          To use any of these rights, email us at{" "}
          <a className="font-semibold text-kb-green hover:underline" href="mailto:kingboost.africa@gmail.com">
            kingboost.africa@gmail.com
          </a>
          . We may need to confirm your identity first. Some information, such as order records, we are required to keep
          for a set period even if you ask for deletion.
        </P>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and similar technologies",
    body: (
      <>
        <P>We keep this simple. The site uses only what it needs to work:</P>
        <UL>
          <li>
            <strong>Your cart</strong> is saved in your own browser (local storage) so it is still there if you come
            back. It stays on your device.
          </li>
          <li>
            <strong>Login cookies</strong> are used only for our team members when they sign in to manage the site.
          </li>
        </UL>
        <P>
          We do not currently use advertising or analytics cookies. If we add any in future, we will update this policy
          and ask for your consent where the law requires.
        </P>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <P>
        Our website is not aimed at children under 18, and we do not knowingly collect their personal information. If you
        are a parent or guardian and believe a child has given us information, please contact us and we will delete it.
      </P>
    ),
  },
  {
    id: "links",
    title: "Links to other websites",
    body: (
      <P>
        Our site links to services such as WhatsApp and social media pages. Those services have their own privacy
        practices, and we are not responsible for them. Please read their policies before you share personal information
        with them.
      </P>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <>
        <P>
          We may update this policy from time to time. The date at the side of this page shows when it last changed, and
          we will make important changes easy to notice. Our{" "}
          <Link href="/delivery-and-refunds" className="font-semibold text-kb-green hover:underline">
            Delivery & Refund Policy
          </Link>{" "}
          and{" "}
          <Link href="/disclaimer" className="font-semibold text-kb-green hover:underline">
            Disclaimer
          </Link>{" "}
          also apply when you use the site.
        </P>
        <Note>This policy is a general explanation of how we handle information and is not legal advice.</Note>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      description="What personal information we collect, why we collect it, who we share it with, and the rights you have."
      updated="September 2026"
      sections={sections}
    />
  );
}
