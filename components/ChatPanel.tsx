"use client";

import { useState, useMemo, useRef, useEffect, type FormEvent } from "react";
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

/* ─── Hook: efecto typewriter para texto streaming ─── */
function useTypewriter(text: string, isStreaming: boolean, charsPerTick = 4): string {
  // Si el componente monta con isStreaming=true, entra en modo typewriter.
  // Si monta con false (mensajes previos), muestra el texto completo.
  const isTypewriterMode = useRef(isStreaming);
  const [revealedLen, setRevealedLen] = useState(() =>
    isStreaming ? 0 : text.length,
  );

  // Tick del typewriter: sigue revelando incluso después de que termine el streaming
  useEffect(() => {
    if (!isTypewriterMode.current || revealedLen >= text.length) return;

    const timer = setTimeout(() => {
      setRevealedLen((prev) => Math.min(prev + charsPerTick, text.length));
    }, 25);

    return () => clearTimeout(timer);
  }, [revealedLen, text.length, charsPerTick]);

  // Mensajes previos: mostrar todo inmediatamente
  if (!isTypewriterMode.current) return text;

  return text.slice(0, revealedLen);
}

/** Renders a single block of markdown text with optional typewriter effect */
function MarkdownBlock({
  text,
  isStreaming = false,
}: {
  text: string;
  isStreaming?: boolean;
}) {
  const displayedText = useTypewriter(text, isStreaming);
  const isRevealing = isStreaming && displayedText.length < text.length;
  const html = useMemo(() => marked.parse(displayedText) as string, [displayedText]);

  return (
    <div className={styles.markdownContent}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {isRevealing && <span className={styles.typingCursor} />}
    </div>
  );
}

/** Renders all parts of an assistant message (text + charts) */
function AssistantMessage({
  parts,
  isStreaming,
}: {
  parts: UIMessage["parts"];
  isStreaming: boolean;
}) {
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <MarkdownBlock
              key={index}
              text={part.text}
              isStreaming={isStreaming}
            />
          );
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al final cuando llegan mensajes nuevos o durante streaming/typewriter
  useEffect(() => {
    const container = document.getElementById("chat-messages");
    if (!container) return;

    const isAtBottom = () => {
      const threshold = 150; // px
      return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    };

    const observer = new MutationObserver(() => {
      if (isAtBottom()) {
        container.scrollTop = container.scrollHeight;
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    return () => {
      observer.disconnect();
    };
  }, [messages, isBusy]);

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
      <div className={styles.messages} id="chat-messages">
        {messages.length === 0 ? (
          <p className={styles.emptyState}>
            Selecciona una carpeta con documentos y escribe tu primera
            pregunta. Por ejemplo: &quot;¿cuáles son mis gastos más altos este
            mes?&quot;
          </p>
        ) : (
          messages.map((message, msgIndex) => (
            <div
              key={message.id}
              className={`${styles.message} ${message.role === "user" ? styles.user : styles.assistant
                }`}
            >
              {message.role === "user" ? (
                message.parts.map((part, index) =>
                  part.type === "text" ? (
                    <span key={index}>{part.text}</span>
                  ) : null,
                )
              ) : (
                <AssistantMessage
                  parts={message.parts}
                  isStreaming={isBusy && msgIndex === messages.length - 1}
                />
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

        {/* Anchor invisible para auto-scroll */}
        <div ref={messagesEndRef} />
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
