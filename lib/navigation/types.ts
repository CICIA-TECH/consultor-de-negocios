import type { LucideIcon } from "lucide-react";

export type NavItemStatus = "active" | "soon";

export interface NavItemConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  status: NavItemStatus;
}
