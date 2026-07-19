"use client";

import type { NavItemConfig } from "@/lib/navigation/types";
import styles from "./NavItem.module.css";

interface NavItemProps {
  item: NavItemConfig;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function NavItem({ item, isActive, onSelect }: NavItemProps) {
  const Icon = item.icon;
  const isDisabled = item.status === "soon";

  if (isDisabled) {
    return (
      <div
        className={`${styles.item} ${styles.itemDisabled}`}
        aria-disabled="true"
        title="Próximamente"
      >
        <Icon className={styles.icon} size={20} aria-hidden="true" />
        <span className={styles.label}>{item.label}</span>
        <span className={styles.badge} aria-label="Próximamente" />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
      onClick={() => onSelect(item.id)}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className={styles.icon} size={20} aria-hidden="true" />
      <span className={styles.label}>{item.label}</span>
    </button>
  );
}
