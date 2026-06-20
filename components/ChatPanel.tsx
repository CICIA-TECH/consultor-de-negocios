"use client";

import { useState, useMemo, type FormEvent } from "react";
import type { UIMessage } from "ai";
import { marked } from "marked";
import { ChartRenderer } from "./ChartRenderer";
import type { ChartProps } from "./ChartRenderer";
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

/** Renders a single block of markdown text */
function MarkdownBlock({ text }: { text: string }) {
  const html = useMemo(() => marked.parse(text) as string, [text]);

  return (
    <div
      className={styles.markdownContent}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Renders all parts of an assistant message (text + charts) */
function AssistantMessage({ parts }: { parts: UIMessage["parts"] }) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <MarkdownBlock key={index} text={part.text} />;
        }

        if (part.type === "tool-renderChart") {
          const chartData = (part.input ?? {}) as ChartProps;
          return <ChartRenderer key={index} {...chartData} />;
        }

        return null;
      })}
    </>
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

  const isTokenLimit = useMemo(() => {
    if (!error) return false;
    const msg = error.message ? error.message.toLowerCase() : "";
    return (
      msg.includes("tokens per minute") ||
      msg.includes("too many tokens") ||
      msg.includes("token_quota_exceeded") ||
      msg.includes("rate limit") ||
      msg.includes("quota_exceeded") ||
      msg.includes("429")
    );
  }, [error]);

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
          <div className={`${styles.message} ${isTokenLimit ? styles.warning : styles.error}`}>
            {isTokenLimit ? (
              <div className={styles.errorContent}>
                <span className={styles.errorIcon}>⏳</span>
                <div className={styles.errorText}>
                  <strong className={styles.errorTitle}>Límite de consultas alcanzado</strong>
                  <p className={styles.errorDescription}>
                    No hay tokens disponibles para la consulta en este momento. Por favor, espera un minuto e inténtalo de nuevo.
                  </p>
                </div>
              </div>
            ) : (
              <span>Error: {error.message}</span>
            )}
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
