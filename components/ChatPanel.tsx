"use client";

import { useState, type FormEvent } from "react";
import styles from "./ChatPanel.module.css";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  isSending: boolean;
  onSendMessage: (text: string) => void;
}

export function ChatPanel({
  messages,
  isSending,
  onSendMessage,
}: ChatPanelProps) {
  const [input, setInput] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    onSendMessage(trimmed);
    setInput("");
  }

  return (
    <section className={styles.chatPanel}>
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <p className={styles.emptyState}>
            Selecciona una carpeta con documentos y escribe tu primera
            pregunta. Por ejemplo: &quot;¿cuáles son mis gastos más altos este
            mes?&quot;
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.role === "user" ? styles.user : styles.assistant
              }`}
            >
              {message.text}
            </div>
          ))
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribe tu pregunta..."
          disabled={isSending}
        />
        <button
          className={styles.sendButton}
          type="submit"
          disabled={isSending || !input.trim()}
        >
          {isSending ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </section>
  );
}
