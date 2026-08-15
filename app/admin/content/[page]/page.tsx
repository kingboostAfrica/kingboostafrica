import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getPageContent } from "@/lib/content";
import ContentEditor from "@/components/admin/ContentEditor";

const validPages = ["home", "about", "agritech", "organics"];
const labels: Record<string, string> = {
  home: "Home Page",
  about: "About Page",
  agritech: "Agritech Page",
  organics: "Organics Page",
};

export default async function AdminContentEditPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  await requireAdmin();
  const { page } = await params;

  if (!validPages.includes(page)) notFound();

  const rows = await getPageContent(page);

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="font-display text-3xl font-bold text-kb-charcoal mb-2">
        {labels[page]}
      </h1>
      <p className="text-kb-charcoal/60 mb-10">
        Changes save immediately to the live site.
      </p>
      <ContentEditor page={page} initialRows={rows} />
    </div>
  );
}
