import PageHeader from "@/components/PageHeader";
import UpdatePasswordForm from "@/components/account/UpdatePasswordForm";

export const metadata = { title: "New password — KingBoostFarms", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <PageHeader title="New password" crumbs={[{ label: "Account", href: "/account" }]} />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <UpdatePasswordForm />
      </div>
    </>
  );
}
