import { requireStaff } from "@/lib/admin";
import PasswordForm from "@/components/admin/PasswordForm";
import TwoStepSetup from "@/components/admin/TwoStepSetup";

export default async function AdminAccountPage() {
  const { user, role } = await requireStaff();
  return (
    <div className="max-w-md mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-2">Your account</h1>
      <p className="text-kb-charcoal/60 mb-8">
        Signed in as <strong>{user.email}</strong> ({role === "admin" ? "full admin" : "staff"}).
      </p>
      <h2 className="font-display text-xl font-bold text-kb-forest mb-4">Change your password</h2>
      <PasswordForm />
      <h2 className="font-display text-xl font-bold text-kb-forest mt-12 mb-2">Two-step login</h2>
      <p className="text-sm text-kb-charcoal/60 mb-4">
        Adds a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy) to your
        password, so a stolen password alone cannot open the admin.
      </p>
      <TwoStepSetup />
    </div>
  );
}
