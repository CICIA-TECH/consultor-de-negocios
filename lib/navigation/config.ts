import {
  Home,
  Sparkles,
  BarChart3,
  FileText,
  Brain,
  Puzzle,
  Settings,
  Building2,
} from "lucide-react";
import type { NavItemConfig } from "./types";

/**
 * Única fuente de verdad para la navegación lateral.
 * Para habilitar una sección nueva, basta con cambiar su `status` a "active"
 * y, si corresponde, agregar su vista en `app/page.tsx`.
 */
export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  { id: "chat", label: "Inicio", icon: Home, status: "active" },
  { id: "asistente", label: "Asistente IA", icon: Sparkles, status: "soon" },
  { id: "analitica", label: "Analítica", icon: BarChart3, status: "soon" },
  { id: "documentos", label: "Documentos", icon: FileText, status: "soon" },
  { id: "empresa", label: "Mi empresa", icon: Building2, status: "active" },
  { id: "conocimiento", label: "Conocimiento", icon: Brain, status: "soon" },
  { id: "integraciones", label: "Integraciones", icon: Puzzle, status: "soon" },
];

export const FOOTER_NAV_ITEMS: NavItemConfig[] = [
  { id: "configuracion", label: "Configuración", icon: Settings, status: "active" },
];

export const ALL_NAV_ITEMS: NavItemConfig[] = [
  ...MAIN_NAV_ITEMS,
  ...FOOTER_NAV_ITEMS,
];

export type ViewId = (typeof ALL_NAV_ITEMS)[number]["id"];

export const DEFAULT_VIEW_ID: ViewId = "chat";
