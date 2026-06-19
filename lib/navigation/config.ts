import {
  MessageCircle,
  Info,
  Building2,
  Zap,
  CalendarDays,
  Newspaper,
  CheckSquare,
  Settings,
  Crown,
} from "lucide-react";
import type { NavItemConfig } from "./types";

/**
 * Única fuente de verdad para la navegación lateral.
 * Para habilitar una sección nueva, basta con cambiar su `status` a "active"
 * y, si corresponde, agregar su vista en `app/page.tsx`.
 */
export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  { id: "chat", label: "Chat con CICIA", icon: MessageCircle, status: "active" },
  { id: "info", label: "Mi información", icon: Info, status: "soon" },
  { id: "empresa", label: "Mi empresa", icon: Building2, status: "active" },
  { id: "atajos", label: "Atajos", icon: Zap, status: "soon" },
  { id: "agenda", label: "Agenda reunión", icon: CalendarDays, status: "soon" },
  { id: "blog", label: "Blog / Noticias", icon: Newspaper, status: "soon" },
  { id: "tareas", label: "Tareas", icon: CheckSquare, status: "soon" },
];

export const FOOTER_NAV_ITEMS: NavItemConfig[] = [
  { id: "configuracion", label: "Configuración", icon: Settings, status: "active" },
  { id: "suscripcion", label: "Suscripción", icon: Crown, status: "soon" },
];

export const ALL_NAV_ITEMS: NavItemConfig[] = [
  ...MAIN_NAV_ITEMS,
  ...FOOTER_NAV_ITEMS,
];

export type ViewId = (typeof ALL_NAV_ITEMS)[number]["id"];

export const DEFAULT_VIEW_ID: ViewId = "chat";
