import { Home, Package, Calendar, Settings, type LucideIcon } from "lucide-react";
 
export interface NavItem {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
  enabled: boolean;
}
 
export const navItems: NavItem[] = [
  { id: "home", label: "Hem", to: "/", icon: Home, enabled: true },
  { id: "delivery", label: "Leveranser", to: "/delivery", icon: Package, enabled: true },
  { id: "booking", label: "Bokning", to: "/booking", icon: Calendar, enabled: false },
  { id: "settings", label: "Inställningar", to: "/settings", icon: Settings, enabled: true },
];