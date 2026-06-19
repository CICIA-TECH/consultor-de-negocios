"use client";

import { useEffect, useState } from "react";
import { ChatPanel, type ChatMessage } from "@/components/ChatPanel";
import { Sidebar } from "@/components/Sidebar";
import {
  isFileSystemAccessSupported,
  readDocumentsFromDirectory,
} from "@/lib/documents/readDirectory";
import type { DocumentItem } from "@/lib/documents/types";
import { getMockChatResponse } from "@/lib/ai/mockChat";
import styles from "./page.module.css";

let nextMessageId = 0;

export default function Home() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isFileSystemAccessSupported());
  }, []);

  async function handlePickFolder() {
    setIsLoadingFolder(true);
    try {
      const directoryHandle = await window.showDirectoryPicker();
      const loadedDocuments = await readDocumentsFromDirectory(directoryHandle);
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

  async function handleSendMessage(text: string) {
    const userMessage: ChatMessage = {
      id: `${nextMessageId++}`,
      role: "user",
      text,
    };
    setMessages((current) => [...current, userMessage]);
    setIsSending(true);

    try {
      const responseText = await getMockChatResponse(text, documents);
      const assistantMessage: ChatMessage = {
        id: `${nextMessageId++}`,
        role: "assistant",
        text: responseText,
      };
      setMessages((current) => [...current, assistantMessage]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className={styles.page}>
      <Sidebar
        documents={documents}
        isLoading={isLoadingFolder}
        isSupported={isSupported}
        onPickFolder={handlePickFolder}
      />
      <ChatPanel
        messages={messages}
        isSending={isSending}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
