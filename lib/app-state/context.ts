"use client";

import { createContext, useContext } from "react";
import type { UIMessage } from "ai";
import type { DocumentItem } from "@/lib/documents/types";

export interface AppStateValue {
  documents: DocumentItem[];
  isUploading: boolean;
  onUploadFiles: (files: FileList) => void;
  onDeleteDocument: (id: string) => void;
  loadedDocsCount: number;
  messages: UIMessage[];
  isBusy: boolean;
  error: Error | undefined;
  onSendMessage: (text: string) => void;
}

export const AppStateContext = createContext<AppStateValue | null>(null);

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState debe usarse dentro de AppShell");
  }
  return ctx;
}
