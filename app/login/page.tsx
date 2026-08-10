import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión — CICIA",
};

export default function LoginPage() {
  return <LoginForm />;
}
