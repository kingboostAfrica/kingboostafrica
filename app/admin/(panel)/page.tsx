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
  Settings,
  Users,
  UserCog,
  Share2,
  AlertCircle,
} from "lucide-react";

type Tool = {
  href: string;
  icon: typeof Package;
  label: string;
  desc: string;
  badge?: string;
  attention?: boolean;
};

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const count = (table: string, filter?: { column: string; value: string }) => {
    const q = supabase.from(table).select("*", { count: "exact", head: true });
    return filter ? q.eq(filter.column, filter.value) : q;
  };

  const [
    { count: pendingOrders },
    { count: cancelRequests },
    { count: productCount },
    { count: categoryCount },
    { count: courseCount },
    { count: serviceCount },
    { count: photoCount },
    { count: newInquiries },
    { count: pendingEnrollments },
    { count: pendingBookings },
    { count: socialCount },
  ] = await Promise.all([
    count("orders", { column: "status", value: "pending" }),
    // paid orders where the customer has asked to cancel (needs your decision)
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid")
      .not("cancel_requested_at", "is", null),
    count("products"),
    count("categories"),
    count("courses"),
    count("consulting_services"),
    count("gallery_items"),
    count("inquiries", { column: "status", value: "new" }),
    count("enrollments", { column: "status", value: "pending" }),
    count("consulting_bookings", { column: "status", value: "pending" }),
    count("social_links"),
  ]);

  const messages = (newInquiries ?? 0) + (pendingEnrollments ?? 0) + (pendingBookings ?? 0);

  const groups: { title: string; tools: Tool[] }[] = [
    {
      title: "Sales",
      tools: [
        {
          href: "/admin/orders",
          icon: ShoppingCart,
          label: "Orders",
          desc: "See orders, mark them shipped, handle cancellations and refunds.",
          badge: `${pendingOrders ?? 0} pending`,
          attention: (cancelRequests ?? 0) > 0,
        },
        {
          href: "/admin/products",
          icon: Package,
          label: "Products",
          desc: "Add, edit, hide or delete Food Mart products and stock.",
          badge: `${productCount ?? 0} listed`,
        },
        {
          href: "/admin/categories",
          icon: Tags,
          label: "Categories",
          desc: "Group products and gallery photos.",
          badge: `${categoryCount ?? 0}`,
        },
        {
          href: "/admin/settings",
          icon: Settings,
          label: "Store settings",
          desc: "VAT, delivery areas and fees, self pickup and WhatsApp number.",
        },
      ],
    },
    {
      title: "Website content",
      tools: [
        {
          href: "/admin/courses",
          icon: BookOpen,
          label: "Academy courses",
          desc: "Publish and edit the courses you teach.",
          badge: `${courseCount ?? 0} listed`,
        },
        {
          href: "/admin/consulting",
          icon: Briefcase,
          label: "Consulting services",
          desc: "Publish and edit the advisory services you offer.",
          badge: `${serviceCount ?? 0} listed`,
        },
        {
          href: "/admin/gallery",
          icon: Images,
          label: "Gallery",
          desc: "Upload photos in bulk and remove old ones.",
          badge: `${photoCount ?? 0} photos`,
        },
        {
          href: "/admin/content",
          icon: FileText,
          label: "Site content",
          desc: "Edit the text and hero photo on the main pages.",
        },
        {
          href: "/admin/social",
          icon: Share2,
          label: "Social media",
          desc: "Choose which social pages show as icons on the site.",
          badge: `${socialCount ?? 0} linked`,
        },
      ],
    },
    {
      title: "People",
      tools: [
        {
          href: "/admin/messages",
          icon: Inbox,
          label: "Messages and sign-ups",
          desc: "Inquiries, course enrollments and consulting requests.",
          badge: `${messages} need attention`,
          attention: messages > 0,
        },
        {
          href: "/admin/team",
          icon: Users,
          label: "Team",
          desc: "Give staff a login, or make another full admin.",
        },
        {
          href: "/admin/account",
          icon: UserCog,
          label: "Your account",
          desc: "Change your own password.",
        },
      ],
    },
  ];

  const alerts: { href: string; text: string }[] = [];
  if ((cancelRequests ?? 0) > 0)
    alerts.push({
      href: "/admin/orders",
      text: `${cancelRequests} customer${cancelRequests === 1 ? " has" : "s have"} asked to cancel a paid order and ${
        cancelRequests === 1 ? "is" : "are"
      } waiting for your decision.`,
    });
  if ((pendingOrders ?? 0) > 0)
    alerts.push({ href: "/admin/orders", text: `${pendingOrders} order${pendingOrders === 1 ? " is" : "s are"} waiting to be processed.` });
  if (messages > 0)
    alerts.push({ href: "/admin/messages", text: `${messages} message${messages === 1 ? "" : "s"} or sign-up${messages === 1 ? "" : "s"} need a reply.` });

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-kb-charcoal">Admin dashboard</h1>
        <p className="text-kb-charcoal/60 mt-1">Every tool for running KingBoostFarms is here.</p>
      </div>

      {alerts.length > 0 && (
        <div className="mb-10 rounded-xl border border-kb-gold/50 bg-kb-gold/10 p-5">
          <p className="mb-2 flex items-center gap-2 font-semibold text-kb-forest">
            <AlertCircle size={18} aria-hidden="true" /> Needs your attention
          </p>
          <ul className="space-y-1 text-sm">
            {alerts.map((a) => (
              <li key={a.text}>
                <Link href={a.href} className="text-kb-charcoal hover:text-kb-green hover:underline">
                  {a.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-10">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="mb-4 font-display text-xl font-bold text-kb-forest">{g.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.tools.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  className="group flex gap-4 rounded-xl border border-kb-forest/15 bg-white p-5 transition-all hover:border-kb-green hover:shadow-md"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${
                      t.attention ? "bg-kb-gold text-kb-forest" : "bg-kb-forest text-kb-gold"
                    }`}
                  >
                    <t.icon size={24} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-kb-charcoal group-hover:text-kb-green">{t.label}</span>
                      {t.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            t.attention ? "bg-kb-gold/25 text-kb-gold-dark" : "bg-kb-mist text-kb-charcoal/60"
                          }`}
                        >
                          {t.badge}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-kb-charcoal/60">{t.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
