import { Suspense } from "react";
import AuthForm from "@/components/account/AuthForm";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Log in — KingBoostFarms",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <PageHeader title="Log in" crumbs={[{ label: "Account", href: "/account" }]} />
      <div className="mx-auto max-w-6xl px-5 py-14">
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </>
  );
}
