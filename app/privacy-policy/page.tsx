import PageHeader from "@/components/PageHeader";

export const metadata = { title: "Privacy Policy — KingBoostFarms" };

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader title="Privacy Policy" description="Last updated: August 2026" />
      <div className="mx-auto max-w-6xl px-5 py-14">

      <div className="max-w-3xl space-y-8 text-kb-charcoal/70 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-bold text-kb-forest mb-2">1. Introduction</h2>
          <p>
            KingBoostFarms (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your privacy and is
            committed to protecting the personal information you share with
            us across our Food Mart, Academy, Consulting, Agritech, and
            Organics services. This policy explains what information we
            collect, how we use it, and the choices you have.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-forest mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Contact details you provide, such as name, email address, and phone number.</li>
            <li>Order and delivery information when you purchase from Food Mart.</li>
            <li>Enrollment details when you sign up for an Academy course.</li>
            <li>Booking and inquiry information submitted for Consulting, Agritech, or Organics services.</li>
            <li>Basic usage data collected automatically, such as pages visited.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-forest mb-2">3. How We Use Your Information</h2>
          <p>
            We use the information we collect to fulfill orders, process
            enrollments and bookings, respond to inquiries, improve our
            products and services, and communicate with you about your
            interactions with KingBoostFarms.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-forest mb-2">4. Sharing of Information</h2>
          <p>
            We do not sell your personal information. We may share it with
            trusted service providers who help us operate our business
            (such as payment, hosting, or delivery partners), or when
            required by law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-forest mb-2">5. Data Security</h2>
          <p>
            We take reasonable technical and organizational measures to
            protect your information from unauthorized access, loss, or
            misuse. No method of transmission or storage is completely
            secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-forest mb-2">6. Your Choices</h2>
          <p>
            You may contact us at any time to ask what personal information
            we hold about you, to request corrections, or to request that we
            delete it, subject to any legal obligations we may have to
            retain certain records.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-forest mb-2">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-forest mb-2">8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact
            us at{" "}
            <a href="mailto:kingboost.africa@gmail.com" className="text-kb-green hover:underline">
              kingboost.africa@gmail.com
            </a>{" "}
            or write to us at 8 Ibudo Oloja Street, Igbanko, Badagry, Lagos
            State, Nigeria.
          </p>
        </section>
      </div>
      </div>
    </>
  );
}
