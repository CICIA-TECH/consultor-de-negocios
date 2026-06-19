"use client";

import { MAIN_NAV_ITEMS, FOOTER_NAV_ITEMS } from "@/lib/navigation/config";
import type { ViewId } from "@/lib/navigation/config";
import { NavItem } from "./NavItem";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  activeView: ViewId;
  onSelectView: (id: ViewId) => void;
}

export function Sidebar({ activeView, onSelectView }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>C</span>
        <span className={styles.brandName}>CICIA</span>
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

      <div className={styles.separator} />

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
    </aside>
  );
}
