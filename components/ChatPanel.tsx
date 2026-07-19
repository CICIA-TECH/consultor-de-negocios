"use client";

import { useState, useMemo, useRef, useEffect, type FormEvent } from "react";
import type { UIMessage } from "ai";
import { marked } from "marked";
import { ChartRenderer } from "./ChartRenderer";
import type { ChartProps } from "./ChartRenderer";
import {
  Send,
  User,
  FileText,
  TrendingUp,
  Star,
  Target,
  ArrowRight,
} from "lucide-react";
import { CiciaIcon } from "./CiciaBranding";
import styles from "./ChatPanel.module.css";

marked.setOptions({ breaks: true, gfm: true });

interface ChatPanelProps {
  messages: UIMessage[];
  isBusy: boolean;
  error: Error | undefined;
  onSendMessage: (text: string) => void;
  loadedDocsCount?: number;
}

/* ─── Typewriter hook ─── */
function useTypewriter(text: string, isStreaming: boolean, charsPerTick = 4): string {
  const isTypewriterMode = useRef(isStreaming);
  const [revealedLen, setRevealedLen] = useState(() => isStreaming ? 0 : text.length);
  useEffect(() => {
    if (!isTypewriterMode.current || revealedLen >= text.length) return;
    const timer = setTimeout(() => setRevealedLen((p) => Math.min(p + charsPerTick, text.length)), 25);
    return () => clearTimeout(timer);
  }, [revealedLen, text.length, charsPerTick]);
  if (!isTypewriterMode.current) return text;
  return text.slice(0, revealedLen);
}

function MarkdownBlock({ text, isStreaming = false }: { text: string; isStreaming?: boolean }) {
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

function AssistantMessage({ parts, isStreaming }: { parts: UIMessage["parts"]; isStreaming: boolean }) {
  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "text") return <MarkdownBlock key={i} text={part.text} isStreaming={isStreaming} />;
        if (part.type === "tool-renderChart") return <ChartRenderer key={i} {...(part.input ?? {}) as ChartProps} />;
        return null;
      })}
    </>
  );
}

export function ChatPanel({ messages, isBusy, error, onSendMessage, loadedDocsCount }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = document.getElementById("chat-messages");
    if (!c) return;
    const atBottom = () => c.scrollHeight - c.scrollTop - c.clientHeight < 150;
    const obs = new MutationObserver(() => { if (atBottom()) c.scrollTop = c.scrollHeight; });
    obs.observe(c, { childList: true, subtree: true, characterData: true });
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    return () => obs.disconnect();
  }, [messages, isBusy]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t || isBusy) return;
    onSendMessage(t);
    setInput("");
  }

  const isTokenLimit = useMemo(() => {
    if (!error) return false;
    const m = error.message?.toLowerCase() ?? "";
    return m.includes("tokens per minute") || m.includes("too many tokens") || m.includes("token_quota_exceeded") || m.includes("rate limit") || m.includes("quota_exceeded") || m.includes("429");
  }, [error]);

  const quickActions = [
    { text: "¿Cómo va el rendimiento de ventas este mes?", prompt: "¿Cómo va el rendimiento de ventas este mes?", color: "#3A5BF3" },
    { text: "¿Qué oportunidades tienen mayor probabilidad?", prompt: "¿Qué oportunidades tienen mayor probabilidad de cierre?", color: "#9546F3" },
    { text: "Genera un resumen de mis reuniones recientes", prompt: "Genera un resumen de mis reuniones recientes.", color: "#00CAB5" },
    { text: "Recomiéndame próximas acciones para mis negocios", prompt: "Recomiéndame las próximas acciones más importantes para mis negocios.", color: "#3A5BF3" },
  ];

  const insights = [
    { label: "Oportunidad destacada", Icon: Star, color: "#9546F3", desc: "DataCorp tiene 85% de probabilidad de cierre.", link: "Ver análisis" },
    { label: "Rendimiento de ventas", Icon: TrendingUp, color: "#3A5BF3", desc: "Has cerrado 32% más negocios este mes.", link: "Ver reporte" },
    { label: "Recomendación IA", Icon: Target, color: "#00CAB5", desc: "Enfócate en 3 oportunidades con alto potencial.", link: "Ver oportunidades" },
  ];

  function handleQuickAction(prompt: string) { if (!isBusy) onSendMessage(prompt); }

  const isWelcome = messages.length === 0;

  return (
    <section className={styles.chatPanel}>
      {/* Header solo en chat */}
      {!isWelcome && (
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.avatarMini}>
              <CiciaIcon size={18} />
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
              <span>{loadedDocsCount} {loadedDocsCount === 1 ? "documento" : "documentos"}</span>
            </div>
          )}
        </div>
      )}

      {isWelcome ? (
        /* ═══ WELCOME SCREEN ═══ */
        <div className={styles.welcomeScreen}>
          {/* Animated aura blobs */}
          <div className={styles.auraContainer} aria-hidden="true">
            <div className={styles.auraBlob1} />
            <div className={styles.auraBlob2} />
            <div className={styles.auraBlob3} />
          </div>

          <div className={styles.welcomeContent}>
            <div className={styles.welcomeHero}>
              <p className={styles.welcomeGreeting}>Hola, Alex 👋</p>
              <h1 className={styles.welcomeTitle}>
                ¿En qué puedo ayudarte <span className={styles.accent}>hoy?</span>
              </h1>
            </div>

            {/* Input centrado */}
            <form className={styles.welcomeForm} onSubmit={handleSubmit}>
              <div className={styles.welcomeInputWrap}>
                <input
                  className={styles.input}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregunta algo a tu asistente IA..."
                  disabled={isBusy}
                />
                <button className={styles.sendBtn} type="submit" disabled={isBusy || !input.trim()} title="Enviar">
                  <Send size={15} />
                </button>
              </div>
            </form>

            {/* Quick actions 2×2 */}
            <div className={styles.qaGrid}>
              {quickActions.map((qa, i) => (
                <button key={i} type="button" className={styles.qaBtn} onClick={() => handleQuickAction(qa.prompt)} disabled={isBusy}>
                  <span className={styles.qaDot} style={{ background: qa.color }} />
                  <span className={styles.qaText}>{qa.text}</span>
                </button>
              ))}
            </div>

            {/* Insights */}
            <div className={styles.insightsSection}>
              <div className={styles.insightsHead}>
                <h2 className={styles.insightsTitle}>Insights generados por IA</h2>
                <button type="button" className={styles.seeAll}>Ver todos</button>
              </div>
              <div className={styles.insightsGrid}>
                {insights.map((ins, i) => {
                  const I = ins.Icon;
                  return (
                    <div key={i} className={styles.insightCard}>
                      <div className={styles.insightTop}>
                        <div className={styles.insightIcon} style={{ background: `${ins.color}1A`, color: ins.color }}>
                          <I size={16} />
                        </div>
                        <span className={styles.insightLabel}>{ins.label}</span>
                      </div>
                      <p className={styles.insightDesc}>{ins.desc}</p>
                      <button type="button" className={styles.insightLink} style={{ color: ins.color }} onClick={() => handleQuickAction(ins.desc)}>
                        {ins.link} <ArrowRight size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className={styles.hint}>La IA de CICIA aprende de tus datos para darte mejores resultados.</p>
          </div>
        </div>
      ) : (
        /* ═══ CHAT MODE ═══ */
        <>
          <div className={styles.messages} id="chat-messages">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div key={msg.id} className={`${styles.messageRow} ${isUser ? styles.rowUser : styles.rowAssistant}`}>
                  {!isUser && (
                    <div className={styles.avatarAssistant}>
                      <CiciaIcon size={20} />
                    </div>
                  )}
                  <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAssistant}`}>
                    {isUser ? msg.parts.map((p, j) => p.type === "text" ? <span key={j} className={styles.userText}>{p.text}</span> : null)
                      : <AssistantMessage parts={msg.parts} isStreaming={isBusy && idx === messages.length - 1} />}
                  </div>
                  {isUser && <div className={styles.avatarUser}><User size={14} /></div>}
                </div>
              );
            })}
            {isBusy && messages[messages.length - 1]?.role === "user" && (
              <div className={`${styles.messageRow} ${styles.rowAssistant}`}>
                <div className={styles.avatarAssistant}>
                  <CiciaIcon size={20} />
                </div>
                <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
                  <div className={styles.bouncingLoader}><span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} /></div>
                </div>
              </div>
            )}
            {error && (
              <div className={`${styles.messageRow} ${isTokenLimit ? styles.warningRow : styles.errorRow}`}>
                <div className={`${styles.bubble} ${isTokenLimit ? styles.warning : styles.error}`}>
                  {isTokenLimit ? (
                    <div className={styles.errorContent}>
                      <span className={styles.errorIcon}>⏳</span>
                      <div className={styles.errorText}>
                        <strong className={styles.errorTitle}>Límite alcanzado</strong>
                        <p className={styles.errorDescription}>Espera un minuto e inténtalo de nuevo.</p>
                      </div>
                    </div>
                  ) : <span>Error: {error.message}</span>}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className={styles.bottomForm} onSubmit={handleSubmit}>
            <div className={styles.bottomInputWrap}>
              <input className={styles.input} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pregunta algo a tu asistente IA..." disabled={isBusy} />
              <button className={styles.sendBtn} type="submit" disabled={isBusy || !input.trim()} title="Enviar"><Send size={15} /></button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
