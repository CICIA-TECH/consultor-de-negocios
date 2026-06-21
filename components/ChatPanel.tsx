"use client";

import { useState, useMemo, useRef, useEffect, type FormEvent } from "react";
import type { UIMessage } from "ai";
import { marked } from "marked";
import { ChartRenderer } from "./ChartRenderer";
import type { ChartProps } from "./ChartRenderer";
import {
  Send,
  Sparkles,
  User,
  PieChart,
  TrendingUp,
  Zap,
  Coins,
  FileText,
} from "lucide-react";
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
  loadedDocsCount?: number;
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
  loadedDocsCount,
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

  const quickActions = [
    {
      title: "Analizar gastos",
      description: "Identificar los mayores gastos del mes actual.",
      prompt: "¿Cuáles son mis gastos más altos este mes?",
      icon: PieChart,
      color: "#3b82f6",
    },
    {
      title: "Proyectar ventas",
      description: "Hacer una proyección de ventas para el trimestre.",
      prompt: "Haz una proyección de mis ventas para este trimestre basada en los datos.",
      icon: TrendingUp,
      color: "#10b981",
    },
    {
      title: "Optimizar operación",
      description: "Buscar áreas de mejora operativa y ahorro.",
      prompt: "¿Qué áreas de mi negocio muestran oportunidades de optimización?",
      icon: Zap,
      color: "#f59e0b",
    },
    {
      title: "Flujo de caja",
      description: "Evaluar la salud de los ingresos y egresos.",
      prompt: "Dame un diagnóstico rápido sobre la salud de mi flujo de caja.",
      icon: Coins,
      color: "#8b5cf6",
    },
  ];

  function handleQuickAction(prompt: string) {
    if (isBusy) return;
    onSendMessage(prompt);
  }

  return (
    <section className={styles.chatPanel}>
      {/* Cabecera del Chat Premium */}
      <div className={styles.chatHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.avatarMini}>
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className={styles.headerTitle}>Asistente de Negocios</h3>
            <div className={styles.modelStatus}>
              <span className={styles.pulseDot} />
              <span>Cerebras gpt-oss-120b</span>
            </div>
          </div>
        </div>
        {loadedDocsCount !== undefined && (
          <div className={styles.headerContext}>
            <FileText size={13} />
            <span>
              {loadedDocsCount} {loadedDocsCount === 1 ? "documento" : "documentos"} de contexto
            </span>
          </div>
        )}
      </div>

      <div className={styles.messages} id="chat-messages">
        {messages.length === 0 ? (
          /* Pantalla de Bienvenida Estilo Hero */
          <div className={styles.welcomeContainer}>
            <div className={styles.welcomeHero}>
              <div className={styles.welcomeLogo}>
                <Sparkles size={32} />
              </div>
              <h2 className={styles.welcomeTitle}>¿Cómo puedo ayudarte hoy?</h2>
              <p className={styles.welcomeSubtitle}>
                Analiza los documentos locales de tu organización, diagnostica estados financieros y genera gráficos interactivos automáticamente.
              </p>
            </div>

            <div className={styles.quickActionsGrid}>
              {quickActions.map((action, i) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    className={styles.quickActionCard}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isBusy}
                  >
                    <div className={styles.quickActionHeader}>
                      <span
                        className={styles.quickActionIconWrapper}
                        style={{
                          backgroundColor: `${action.color}15`,
                          color: action.color,
                        }}
                      >
                        <ActionIcon size={16} />
                      </span>
                      <h4 className={styles.quickActionTitle}>{action.title}</h4>
                    </div>
                    <p className={styles.quickActionDesc}>{action.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((message, msgIndex) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`${styles.messageRow} ${
                  isUser ? styles.rowUser : styles.rowAssistant
                }`}
              >
                {!isUser && (
                  <div className={styles.avatarAssistant}>
                    <Sparkles size={14} />
                  </div>
                )}

                <div
                  className={`${styles.bubble} ${
                    isUser ? styles.bubbleUser : styles.bubbleAssistant
                  }`}
                >
                  {isUser ? (
                    message.parts.map((part, index) =>
                      part.type === "text" ? (
                        <span key={index} className={styles.userText}>
                          {part.text}
                        </span>
                      ) : null
                    )
                  ) : (
                    <AssistantMessage
                      parts={message.parts}
                      isStreaming={isBusy && msgIndex === messages.length - 1}
                    />
                  )}
                </div>

                {isUser && (
                  <div className={styles.avatarUser}>
                    <User size={14} />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isBusy && messages[messages.length - 1]?.role === "user" && (
          <div className={`${styles.messageRow} ${styles.rowAssistant}`}>
            <div className={styles.avatarAssistant}>
              <Sparkles size={14} />
            </div>
            <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
              <div className={styles.bouncingLoader}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className={`${styles.messageRow} ${
              isTokenLimit ? styles.warningRow : styles.errorRow
            }`}
          >
            <div className={`${styles.bubble} ${isTokenLimit ? styles.warning : styles.error}`}>
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
          placeholder={
            loadedDocsCount && loadedDocsCount > 0
              ? "Haz una pregunta sobre tus documentos..."
              : "Escribe tu pregunta..."
          }
          disabled={isBusy}
        />
        <button
          className={styles.sendButton}
          type="submit"
          disabled={isBusy || !input.trim()}
          title="Enviar mensaje"
        >
          <Send size={16} />
        </button>
      </form>
    </section>
  );
}
