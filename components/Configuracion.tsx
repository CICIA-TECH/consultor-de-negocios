"use client";

import { ThemeToggle } from "./ThemeToggle";
import styles from "./Configuracion.module.css";

export function Configuracion() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Configuración</h1>
      <p className={styles.subtitle}>
        Personaliza tu experiencia en CICIA.
      </p>

      <section className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Apariencia</h2>
          <p className={styles.cardDescription}>
            Cambia entre modo claro y oscuro.
          </p>
        </div>
        <ThemeToggle />
      </section>
    </div>
  );
}
