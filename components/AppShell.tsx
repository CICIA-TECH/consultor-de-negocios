"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useChat } from "@ai-sdk/react";
import { Sidebar } from "@/components/Sidebar";
import { AppStateContext } from "@/lib/app-state/context";
import {
  isFileSystemAccessSupported,
  readDocumentsFromDirectory,
} from "@/lib/documents/readDirectory";
import type { DocumentItem } from "@/lib/documents/types";
import styles from "@/app/page.module.css";

interface AppShellProps {
  userEmail: string;
  children: ReactNode;
}

export function AppShell({ userEmail, children }: AppShellProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isFileSystemAccessSupported());
  }, []);

  const documentContext = useMemo(() => {
    return documents
      .filter((doc) => doc.status === "loaded" && doc.content)
      .map((doc) => `--- ${doc.name} ---\n${doc.content}`)
      .join("\n\n");
  }, [documents]);

  const { messages, sendMessage, status, error } = useChat();

  async function handlePickFolder() {
    setIsLoadingFolder(true);
    try {
      const directoryHandle = await window.showDirectoryPicker();
      const loadedDocuments =
        await readDocumentsFromDirectory(directoryHandle);
      setDocuments(loadedDocuments);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      console.error(error);
    } finally {
      setIsLoadingFolder(false);
    }
  }

  const isBusy = status === "submitted" || status === "streaming";

  return (
    <AppStateContext.Provider
      value={{
        documents,
        isLoadingFolder,
        isSupported,
        onPickFolder: handlePickFolder,
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
