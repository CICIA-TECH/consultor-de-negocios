"use client";

import { MiEmpresa } from "@/components/MiEmpresa";
import { useAppState } from "@/lib/app-state/context";

export default function EmpresaPage() {
  const { documents, isLoadingFolder, isSupported, onPickFolder } =
    useAppState();

  return (
    <MiEmpresa
      documents={documents}
      isLoading={isLoadingFolder}
      isSupported={isSupported}
      onPickFolder={onPickFolder}
    />
  );
}
