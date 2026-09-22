import Link from "next/link";
import Image from "next/image";
import { requireStaff } from "@/lib/admin";
import { LayoutDashboard, Inbox, ShoppingCart, UserCog } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import AdminBackBar from "@/components/admin/AdminBackBar";

// The header only keeps the few things you use all day. Every tool lives on the dashboard.
const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
];
const staffLinks = [
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/account", label: "Account", icon: UserCog },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await requireStaff();
  const links = role === "admin" ? adminLinks : staffLinks;

  return (
    <div className="min-h-screen bg-kb-charcoal/[0.02]">
      <header className="sticky top-0 z-40 bg-kb-forest border-b-2 border-kb-gold print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between gap-2 sm:gap-6">
          <Link href="/admin" className="flex shrink-0 items-center gap-3">
            <Image src="/kingboost-icon-light.png" alt="" width={32} height={44} className="h-10 w-auto" />
            <span className="hidden font-display text-lg font-bold text-white sm:inline">Admin</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-label={l.label}
                title={l.label}
                className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 px-2.5 sm:px-3 py-2 rounded-lg whitespace-nowrap transition-colors"
              >
                <l.icon size={18} />
                <span className="hidden sm:inline">{l.label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-3">
            <Link href="/" target="_blank" className="hidden text-sm font-medium text-white/80 hover:text-white sm:block">
              View site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="print:hidden">
        <AdminBackBar isAdmin={role === "admin"} />
      </div>
      <main>{children}</main>
    </div>
  );
}
