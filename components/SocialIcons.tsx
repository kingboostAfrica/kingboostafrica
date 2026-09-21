import { ICON_PATHS } from "@/lib/social-icon-paths";
import { platformLabel, type SocialLink } from "@/lib/social";
import { whatsappLink } from "@/lib/whatsapp";

function Icon({ name, size }: { name: string; size: number }) {
  if (name === "linkedin") {
    // No LinkedIn shape in the icon set we use, so it is drawn as the familiar "in" badge.
    return (
      <span
        aria-hidden="true"
        className="flex items-center justify-center rounded-[3px] bg-current font-sans text-[10px] font-extrabold leading-none"
        style={{ width: size, height: size }}
      >
        <span className="text-kb-forest">in</span>
      </span>
    );
  }
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

// Row of round social icons. `whatsapp` (from Settings) is added automatically when set.
export default function SocialIcons({
  links,
  whatsapp,
  tone = "light",
  size = 18,
}: {
  links: SocialLink[];
  whatsapp?: string | null;
  tone?: "light" | "dark";
  size?: number;
}) {
  const items: { key: string; label: string; href: string }[] = [
    ...links.map((l) => ({ key: l.platform, label: platformLabel(l.platform), href: l.url })),
    ...(whatsapp ? [{ key: "whatsapp", label: "WhatsApp", href: whatsappLink(whatsapp) }] : []),
  ];
  if (items.length === 0) return null;

  const cls =
    tone === "light"
      ? "border-white/25 text-white/80 hover:border-kb-gold hover:bg-kb-gold hover:text-kb-forest"
      : "border-kb-forest/20 text-kb-forest hover:border-kb-green hover:bg-kb-green hover:text-white";

  return (
    <ul className="flex flex-wrap items-center gap-2" aria-label="Social media">
      {items.map((i) => (
        <li key={i.key}>
          <a
            href={i.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`KingBoostFarms on ${i.label}`}
            title={i.label}
            className={`flex ${size <= 14 ? "h-6 w-6" : "h-9 w-9"} items-center justify-center rounded-full border transition-colors ${cls}`}
          >
            <Icon name={i.key} size={size} />
          </a>
        </li>
      ))}
    </ul>
  );
}
