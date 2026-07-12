import {
  Headphones,
  Plug,
  BatteryCharging,
  Cable,
  Speaker,
  Car,
  HardDrive,
  Watch,
  Video,
  ShieldCheck,
  Tag,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Headphones,
  Plug,
  BatteryCharging,
  Cable,
  Speaker,
  Car,
  HardDrive,
  Watch,
  Video,
  ShieldCheck,
};

export function CategoryIcon({
  icon,
  size = 22,
  className,
}: {
  icon?: string | null;
  size?: number;
  className?: string;
}) {
  const Icon = (icon && ICONS[icon]) || Tag;
  return <Icon size={size} className={className} />;
}
