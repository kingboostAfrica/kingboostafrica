import PageHeader from "@/components/PageHeader";
import QuoteRequestForm from "@/components/QuoteRequestForm";

export const metadata = {
  title: "Request a bulk quote — KingBoostFarms",
  description: "Buying for a business, event or large household? Tell us what you need and we'll send a price.",
};

export default function RequestQuotePage() {
  return (
    <>
      <PageHeader
        title="Request a bulk quote"
        description="List what you need and how much, and our team will get back to you with pricing."
        crumbs={[{ label: "Food Mart", href: "/food-mart" }]}
      />
      <div className="mx-auto max-w-2xl px-5 py-14">
        <QuoteRequestForm />
      </div>
    </>
  );
}
