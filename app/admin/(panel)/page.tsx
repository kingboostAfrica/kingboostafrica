import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import {
  Package,
  BookOpen,
  Briefcase,
  Inbox,
  Images,
  FileText,
  ShoppingCart,
  Tags,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const count = (table: string, filter?: { column: string; value: string }) => {
    const q = supabase.from(table).select("*", { count: "exact", head: true });
    return filter ? q.eq(filter.column, filter.value) : q;
  };

  const [
    { count: pendingOrders },
    { count: productCount },
    { count: categoryCount },
    { count: courseCount },
    { count: serviceCount },
    { count: photoCount },
    { count: newInquiries },
    { count: pendingEnrollments },
    { count: pendingBookings },
  ] = await Promise.all([
    count("orders", { column: "status", value: "pending" }),
    count("products"),
    count("categories"),
    count("courses"),
    count("consulting_services"),
    count("gallery_items"),
    count("inquiries", { column: "status", value: "new" }),
    count("enrollments", { column: "status", value: "pending" }),
    count("consulting_bookings", { column: "status", value: "pending" }),
  ]);

  const unread = (newInquiries ?? 0) + (pendingEnrollments ?? 0) + (pendingBookings ?? 0);

  const cards = [
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders", count: `${pendingOrders ?? 0} pending` },
    { href: "/admin/messages", icon: Inbox, label: "Messages & Sign-ups", count: `${unread} need attention` },
    { href: "/admin/products", icon: Package, label: "Food Mart Products", count: `${productCount ?? 0} item(s)` },
    { href: "/admin/categories", icon: Tags, label: "Categories", count: `${categoryCount ?? 0} item(s)` },
    { href: "/admin/courses", icon: BookOpen, label: "Academy Courses", count: `${courseCount ?? 0} item(s)` },
    { href: "/admin/consulting", icon: Briefcase, label: "Consulting Services", count: `${serviceCount ?? 0} item(s)` },
    { href: "/admin/gallery", icon: Images, label: "Gallery Photos", count: `${photoCount ?? 0} photo(s)` },
    { href: "/admin/content", icon: FileText, label: "Site Content", count: "Edit page text" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-kb-charcoal">Admin Dashboard</h1>
        <p className="text-kb-charcoal/60 mt-1">
          Manage KingBoostFarms content across all five verticals.
        </p>
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
              <p className="text-sm text-kb-charcoal/60">{c.count}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
