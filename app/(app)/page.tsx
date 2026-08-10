"use client";

import { ChatPanel } from "@/components/ChatPanel";
import { useAppState } from "@/lib/app-state/context";

export default function ChatPage() {
  const { messages, isBusy, error, loadedDocsCount, onSendMessage } =
    useAppState();

  return (
    <ChatPanel
      messages={messages}
      isBusy={isBusy}
      error={error}
      loadedDocsCount={loadedDocsCount}
      onSendMessage={onSendMessage}
    />
  );
}
