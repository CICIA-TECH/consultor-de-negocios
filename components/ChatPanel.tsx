"use client";

import { useState, useMemo, type FormEvent } from "react";
import type { UIMessage } from "ai";
import { marked } from "marked";
import styles from "./ChatPanel.module.css";

// Configure marked for clean output
marked.setOptions({
  breaks: true,
  gfm: true,
});

interface ChatPanelProps {
  messages: UIMessage[];
  isBusy: boolean;
  error: Error | undefined;
  onSendMessage: (text: string) => void;
}

function AssistantMessage({ parts }: { parts: UIMessage["parts"] }) {
  const html = useMemo(() => {
    const text = parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
    return marked.parse(text) as string;
  }, [parts]);

  return (
    <div
      className={styles.markdownContent}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function ChatPanel({
  messages,
  isBusy,
  error,
  onSendMessage,
}: ChatPanelProps) {
  const [input, setInput] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;

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
              {message.role === "user" ? (
                message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <span key={index}>{part.text}</span>
                  ) : null,
                )
              ) : (
                <AssistantMessage parts={message.parts} />
              )}
            </div>
          ))
        )}

        {isBusy && messages[messages.length - 1]?.role === "user" && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <span className={styles.loadingDots}>Pensando...</span>
          </div>
        )}

        {error && (
          <div className={`${styles.message} ${styles.error}`}>
            Error: {error.message}
          </div>
        )}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escribe tu pregunta..."
          disabled={isBusy}
        />
        <button
          className={styles.sendButton}
          type="submit"
          disabled={isBusy || !input.trim()}
        >
          {isBusy ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </section>
  );
}
