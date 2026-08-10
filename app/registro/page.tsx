import type { Metadata } from "next";
import { RegistroForm } from "@/components/RegistroForm";

export const metadata: Metadata = {
  title: "Crear cuenta — CICIA",
};

export default function RegistroPage() {
  return <RegistroForm />;
}
