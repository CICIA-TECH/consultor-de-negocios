"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  storeTheme,
  type Theme,
} from "@/lib/theme/theme";
import styles from "./ThemeToggle.module.css";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [override, setOverride] = useState<Theme | null>(null);
  const [systemTheme, setSystemTheme] = useState<Theme>("light");

  useEffect(() => {
    setOverride(getStoredTheme());
    setSystemTheme(getSystemTheme());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemTheme(getSystemTheme());
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const effectiveTheme = override ?? systemTheme;

  function handleToggle() {
    const next: Theme = effectiveTheme === "dark" ? "light" : "dark";
    setOverride(next);
    applyTheme(next);
    storeTheme(next);
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={handleToggle}
      aria-label="Cambiar entre modo claro y oscuro"
    >
      {effectiveTheme === "dark" ? "Modo oscuro" : "Modo claro"}
    </button>
  );
}
