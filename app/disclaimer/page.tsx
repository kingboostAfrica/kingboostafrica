export const metadata = { title: "Disclaimer — KingBoostFarms" };

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <h1 className="font-display text-4xl font-bold text-kb-charcoal mb-2">
        Disclaimer
      </h1>
      <p className="text-sm text-kb-charcoal/50 mb-10">Last updated: August 2026</p>

      <div className="space-y-8 text-kb-charcoal/70 leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-bold text-kb-charcoal mb-2">General Information</h2>
          <p>
            The information provided by KingBoostFarms on this website is
            for general informational purposes only. All information is
            provided in good faith, however we make no representation or
            warranty of any kind, express or implied, regarding the
            accuracy, adequacy, validity, reliability, availability, or
            completeness of any information on the site.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-charcoal mb-2">Product & Availability Disclaimer</h2>
          <p>
            Product images, descriptions, and prices on Food Mart are for
            illustrative purposes and may vary from the actual item
            delivered. Availability of produce is subject to seasonal supply
            and stock levels.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-charcoal mb-2">Advisory & Training Disclaimer</h2>
          <p>
            Content and guidance provided through Academy courses and
            Consulting services reflect general agricultural and business
            practices. They do not constitute professional, financial, legal,
            or agronomic advice specific to your circumstances, and should
            not be relied upon as a substitute for tailored professional
            consultation.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-charcoal mb-2">Agritech & Organics Disclaimer</h2>
          <p>
            Outcomes from Agritech tools and Organics products can vary
            based on location, soil, climate, and application. We make no
            guarantee of specific yields or results.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-charcoal mb-2">External Links Disclaimer</h2>
          <p>
            This site may contain links to third-party websites. We do not
            warrant, endorse, or assume responsibility for the accuracy or
            reliability of any information offered by third-party sites
            linked through our platform.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-charcoal mb-2">Limitation of Liability</h2>
          <p>
            Under no circumstance shall KingBoostFarms be liable for any loss
            or damage of any kind incurred as a result of the use of this
            site or reliance on any information provided. Your use of the
            site and your reliance on any information is solely at your own
            risk.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-kb-charcoal mb-2">Contact Us</h2>
          <p>
            Questions about this Disclaimer can be sent to{" "}
            <a href="mailto:kingboost.africa@gmail.com" className="text-kb-green hover:underline">
              kingboost.africa@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
