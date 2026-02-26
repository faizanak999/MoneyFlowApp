import {
  Car,
  Gamepad2,
  GraduationCap,
  Heart,
  Home,
  Plane,
  ShoppingBag,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

const iconBySlug: Record<string, LucideIcon> = {
  food: Utensils,
  shopping: ShoppingBag,
  transport: Car,
  bills: Zap,
  housing: Home,
  entertainment: Gamepad2,
  health: Heart,
  education: GraduationCap,
  travel: Plane,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return iconBySlug[slug] ?? ShoppingBag;
}
