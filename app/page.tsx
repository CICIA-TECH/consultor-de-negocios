"use client";

import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatPanel } from "@/components/ChatPanel";
import { Sidebar } from "@/components/Sidebar";
import { MiEmpresa } from "@/components/MiEmpresa";
import { Configuracion } from "@/components/Configuracion";
import { DEFAULT_VIEW_ID, type ViewId } from "@/lib/navigation/config";
import {
  isFileSystemAccessSupported,
  readDocumentsFromDirectory,
} from "@/lib/documents/readDirectory";
import type { DocumentItem } from "@/lib/documents/types";
import styles from "./page.module.css";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewId>(DEFAULT_VIEW_ID);
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
    <div className={styles.page}>
      <Sidebar activeView={activeView} onSelectView={setActiveView} />

      {activeView === "chat" && (
        <ChatPanel
          messages={messages}
          isBusy={isBusy}
          error={error}
          onSendMessage={(text) =>
            sendMessage({ text }, { body: { documentContext } })
          }
        />
      )}

      {activeView === "empresa" && (
        <MiEmpresa
          documents={documents}
          isLoading={isLoadingFolder}
          isSupported={isSupported}
          onPickFolder={handlePickFolder}
        />
      )}

      {activeView === "configuracion" && <Configuracion />}
    </div>
  );
}
