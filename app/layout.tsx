import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { applyStoredThemeScript } from "@/lib/theme/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Consultor de Negocios",
  description:
    "Asesoría empresarial impulsada por IA: sube documentos de tu empresa y obtén análisis y diagnósticos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: applyStoredThemeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
