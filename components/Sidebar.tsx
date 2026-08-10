"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS, FOOTER_NAV_ITEMS } from "@/lib/navigation/config";
import { NavItem } from "./NavItem";
import { CiciaLogo } from "./CiciaBranding";
import { LogoutButton } from "./LogoutButton";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  userEmail: string;
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {/* Dynamic Cicia Logo (Adapts to Light/Dark automatically) */}
      <div className={styles.brand}>
        <CiciaLogo height={38} />
      </div>

      <nav className={styles.nav} aria-label="Navegación principal">
        {MAIN_NAV_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} isActive={pathname === item.href} />
        ))}
      </nav>

      <div className={styles.spacer} />

      <nav className={styles.nav} aria-label="Cuenta">
        {FOOTER_NAV_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} isActive={pathname === item.href} />
        ))}
      </nav>

      {/* Perfil de usuario */}
      <div className={styles.separator} />
      <div className={styles.profile}>
        <div className={styles.profileAvatar}>
          <span>{userEmail.slice(0, 2).toUpperCase()}</span>
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.profileName}>{userEmail}</span>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
