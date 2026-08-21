"use client";

import { MiEmpresa } from "@/components/MiEmpresa";
import { useAppState } from "@/lib/app-state/context";

export default function EmpresaPage() {
  const { documents, isUploading, onUploadFiles, onDeleteDocument } =
    useAppState();

  return (
    <MiEmpresa
      documents={documents}
      isUploading={isUploading}
      onUploadFiles={onUploadFiles}
      onDeleteDocument={onDeleteDocument}
    />
  );
}
