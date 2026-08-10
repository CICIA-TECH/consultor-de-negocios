"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { CiciaLogo } from "./CiciaBranding";
import styles from "./AuthForm.module.css";

export function RegistroForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "Ya existe una cuenta con este correo."
          : signUpError.message.toLowerCase().includes("rate limit")
            ? "Ya enviamos un correo hace poco. Espera un minuto antes de reintentar."
            : "No se pudo crear la cuenta. Intenta nuevamente.",
      );
      setIsSubmitting(false);
      return;
    }

    // Supabase no devuelve error si el correo ya está registrado y confirmado
    // (evita filtrar qué emails existen); en ese caso el user devuelto trae
    // `identities` vacío en vez de un array con la identidad recién creada.
    if (data.user && data.user.identities?.length === 0) {
      setError("Ya existe una cuenta con este correo.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitted(true);
    setIsSubmitting(false);
  }

  if (isSubmitted) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <CiciaLogo height={30} />
          </div>
          <h1 className={styles.title}>Revisa tu correo</h1>
          <p className={styles.subtitle}>
            Te enviamos un enlace de confirmación a <strong>{email}</strong>.
            Ábrelo para activar tu cuenta e iniciar sesión.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <CiciaLogo height={30} />
        </div>
        <h1 className={styles.title}>Crea tu cuenta</h1>
        <p className={styles.subtitle}>Empieza a usar tu consultor de negocios IA.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">
              Confirma tu contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className={styles.footer}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
