import Link from "next/link";
import AccountLogout from "@/components/account/AccountLogout";

export default function AccountTabs({ active }: { active: "orders" | "wishlist" }) {
  const tab = (href: string, label: string, key: string) => (
    <Link
      href={href}
      aria-current={active === key ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        active === key ? "bg-kb-forest text-white" : "bg-kb-mist text-kb-charcoal hover:text-kb-green"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Account" className="flex gap-2">
        {tab("/account", "Orders & details", "orders")}
        {tab("/account/wishlist", "Wishlist", "wishlist")}
      </nav>
      <AccountLogout />
    </div>
  );
}
