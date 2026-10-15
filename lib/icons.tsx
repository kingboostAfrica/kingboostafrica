import {
  Award,
  BadgeCheck,
  Droplets,
  Factory,
  Flame,
  Heart,
  Leaf,
  Package,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Truck,
  Wheat,
  type LucideIcon,
} from "lucide-react";

// Icons the admin can choose by name in Admin > Site content (type e.g. "Leaf").
const ICONS: Record<string, LucideIcon> = {
  Award,
  BadgeCheck,
  Droplets,
  Factory,
  Flame,
  Heart,
  Leaf,
  Package,
  ShieldCheck,
  Sparkles,
  Sprout,
  Sun,
  Truck,
  Wheat,
};

export function getIcon(name: string | null | undefined, fallback: LucideIcon = Leaf): LucideIcon {
  return (name && ICONS[name]) || fallback;
}
