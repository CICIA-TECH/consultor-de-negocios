"use client";

import type { DocumentItem } from "@/lib/documents/types";
import styles from "./MiEmpresa.module.css";

const STATUS_LABEL: Record<DocumentItem["status"], string> = {
  loaded: "Cargado",
  unsupported: "No soportado",
  error: "Error",
};

const STATUS_CLASS: Record<DocumentItem["status"], string> = {
  loaded: styles.statusLoaded,
  unsupported: styles.statusUnsupported,
  error: styles.statusError,
};

interface MiEmpresaProps {
  documents: DocumentItem[];
  isLoading: boolean;
  isSupported: boolean;
  onPickFolder: () => void;
}

export function MiEmpresa({
  documents,
  isLoading,
  isSupported,
  onPickFolder,
}: MiEmpresaProps) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mi empresa</h1>
      <p className={styles.subtitle}>
        Administra la información de tu organización: documentos, archivos y
        configuraciones relacionadas con tu negocio.
      </p>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Documentos</h2>

        {!isSupported && (
          <p className={styles.warning}>
            Tu navegador no soporta seleccionar carpetas locales. Usa Chrome o
            Edge para esta función.
          </p>
        )}

        <button
          className={styles.pickButton}
          onClick={onPickFolder}
          disabled={!isSupported || isLoading}
        >
          {isLoading ? "Cargando..." : "Seleccionar carpeta"}
        </button>

        {documents.length === 0 ? (
          <p className={styles.emptyState}>
            Aún no hay documentos. Selecciona una carpeta con PDFs o archivos
            Excel/CSV.
          </p>
        ) : (
          <ul className={styles.fileList}>
            {documents.map((doc) => (
              <li key={doc.id} className={styles.fileItem}>
                <span className={styles.fileName} title={doc.name}>
                  {doc.name}
                </span>
                <span className={STATUS_CLASS[doc.status]}>
                  {STATUS_LABEL[doc.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
