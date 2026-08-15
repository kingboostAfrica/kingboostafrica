import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Package, BookOpen, Briefcase, Inbox } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const [{ count: productCount }, { count: courseCount }, { count: serviceCount }, { count: messageCount }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("courses").select("*", { count: "exact", head: true }),
      supabase.from("consulting_services").select("*", { count: "exact", head: true }),
      supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    ]);

  const cards = [
    { href: "/admin/products", icon: Package, label: "Food Mart Products", count: productCount ?? 0 },
    { href: "/admin/courses", icon: BookOpen, label: "Academy Courses", count: courseCount ?? 0 },
    { href: "/admin/consulting", icon: Briefcase, label: "Consulting Services", count: serviceCount ?? 0 },
    { href: "/admin/messages", icon: Inbox, label: "New Messages", count: messageCount ?? 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-kb-charcoal">
            Admin Dashboard
          </h1>
          <p className="text-kb-charcoal/60 mt-1">
            Manage KingBoostFarms content across all five verticals.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="p-6 border border-kb-green/15 rounded-2xl hover:bg-kb-green/5 transition-colors flex items-center gap-4"
          >
            <c.icon className="text-kb-gold-dark" size={28} />
            <div>
              <p className="font-medium text-kb-charcoal">{c.label}</p>
              <p className="text-sm text-kb-charcoal/60">{c.count} item(s)</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
