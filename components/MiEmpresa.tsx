"use client";

import { useRef } from "react";
import type { DocumentItem } from "@/lib/documents/types";
import styles from "./MiEmpresa.module.css";

const STATUS_LABEL: Record<DocumentItem["status"], string> = {
  uploading: "Subiendo...",
  parsing: "Procesando...",
  loaded: "Cargado",
  unsupported: "No soportado",
  error: "Error",
};

const STATUS_CLASS: Record<DocumentItem["status"], string> = {
  uploading: styles.statusUploading,
  parsing: styles.statusParsing,
  loaded: styles.statusLoaded,
  unsupported: styles.statusUnsupported,
  error: styles.statusError,
};

interface MiEmpresaProps {
  documents: DocumentItem[];
  isUploading: boolean;
  onUploadFiles: (files: FileList) => void;
  onDeleteDocument: (id: string) => void;
}

export function MiEmpresa({
  documents,
  isUploading,
  onUploadFiles,
  onDeleteDocument,
}: MiEmpresaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(e.target.files);
    }
    e.target.value = "";
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mi empresa</h1>
      <p className={styles.subtitle}>
        Administra la información de tu organización: documentos, archivos y
        configuraciones relacionadas con tu negocio.
      </p>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Documentos</h2>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button
          className={styles.pickButton}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Subiendo..." : "Subir documentos"}
        </button>

        {documents.length === 0 ? (
          <p className={styles.emptyState}>
            Aún no hay documentos. Sube PDFs o archivos Excel/CSV de tu
            empresa.
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
                <button
                  className={styles.deleteButton}
                  onClick={() => onDeleteDocument(doc.id)}
                  title="Borrar documento"
                  aria-label={`Borrar ${doc.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
