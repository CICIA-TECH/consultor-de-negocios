"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useChat } from "@ai-sdk/react";
import { Sidebar } from "@/components/Sidebar";
import { AppStateContext } from "@/lib/app-state/context";
import {
  deleteDocument,
  fetchDocuments,
  uploadDocument,
} from "@/lib/documents/uploadDocuments";
import type { DocumentItem } from "@/lib/documents/types";
import styles from "@/app/page.module.css";

interface AppShellProps {
  userEmail: string;
  children: ReactNode;
}

export function AppShell({ userEmail, children }: AppShellProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments().then(setDocuments);
  }, []);

  const documentContext = useMemo(() => {
    return documents
      .filter((doc) => doc.status === "loaded" && doc.content)
      .map((doc) => `--- ${doc.name} ---\n${doc.content}`)
      .join("\n\n");
  }, [documents]);

  const { messages, sendMessage, status, error } = useChat();

  function upsertDocument(doc: DocumentItem) {
    setDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === doc.id);
      if (idx === -1) return [doc, ...prev];
      const next = [...prev];
      next[idx] = doc;
      return next;
    });
  }

  async function handleUploadFiles(files: FileList) {
    setIsUploading(true);
    try {
      await Promise.all(
        Array.from(files).map((file) => uploadDocument(file, upsertDocument)),
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDeleteDocument(id: string) {
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await deleteDocument(doc);
  }

  const isBusy = status === "submitted" || status === "streaming";

  return (
    <AppStateContext.Provider
      value={{
        documents,
        isUploading,
        onUploadFiles: handleUploadFiles,
        onDeleteDocument: handleDeleteDocument,
        loadedDocsCount: documents.filter((doc) => doc.status === "loaded")
          .length,
        messages,
        isBusy,
        error,
        onSendMessage: (text: string) =>
          sendMessage({ text }, { body: { documentContext } }),
      }}
    >
      <div className={styles.page}>
        <Sidebar userEmail={userEmail} />
        {children}
      </div>
    </AppStateContext.Provider>
  );
}
