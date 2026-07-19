"use client";

import React from "react";
import { MAIN_NAV_ITEMS, FOOTER_NAV_ITEMS } from "@/lib/navigation/config";
import type { ViewId } from "@/lib/navigation/config";
import { NavItem } from "./NavItem";
import { CiciaLogo } from "./CiciaBranding";
import { ChevronDown } from "lucide-react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  activeView: ViewId;
  onSelectView: (id: ViewId) => void;
}

export function Sidebar({ activeView, onSelectView }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {/* Dynamic Cicia Logo (Adapts to Light/Dark automatically) */}
      <div className={styles.brand}>
        <CiciaLogo height={38} />
      </div>

      <nav className={styles.nav} aria-label="Navegación principal">
        {MAIN_NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            onSelect={(id) => onSelectView(id as ViewId)}
          />
        ))}
      </nav>

      <div className={styles.spacer} />

      <nav className={styles.nav} aria-label="Cuenta">
        {FOOTER_NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            onSelect={(id) => onSelectView(id as ViewId)}
          />
        ))}
      </nav>

      {/* Perfil de usuario */}
      <div className={styles.separator} />
      <div className={styles.profile}>
        <div className={styles.profileAvatar}>
          <span>AP</span>
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.profileName}>Alex Pérez</span>
          <span className={styles.profileRole}>Director Ejecutivo</span>
        </div>
        <ChevronDown size={14} className={styles.profileChevron} />
      </div>
    </aside>
  );
}
