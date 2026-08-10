"use client";

import Link from "next/link";
import type { NavItemConfig } from "@/lib/navigation/types";
import styles from "./NavItem.module.css";

interface NavItemProps {
  item: NavItemConfig;
  isActive: boolean;
}

export function NavItem({ item, isActive }: NavItemProps) {
  const Icon = item.icon;
  const isDisabled = item.status === "soon" || !item.href;

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
    <Link
      href={item.href!}
      className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className={styles.icon} size={20} aria-hidden="true" />
      <span className={styles.label}>{item.label}</span>
    </Link>
  );
}
