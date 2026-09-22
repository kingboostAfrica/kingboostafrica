import PageHeader from "@/components/PageHeader";
import TrackOrderForm from "@/components/TrackOrderForm";

export const metadata = {
  title: "Track my order — KingBoostFarms",
  robots: { index: false, follow: false },
};

export default function TrackOrderPage() {
  return (
    <>
      <PageHeader
        title="Track my order"
        description="Enter your order reference and the email you used, to see its current status."
      />
      <div className="mx-auto max-w-md px-5 py-14">
        <TrackOrderForm />
      </div>
    </>
  );
}
