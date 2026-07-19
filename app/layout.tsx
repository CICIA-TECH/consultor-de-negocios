import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { applyStoredThemeScript } from "@/lib/theme/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CICIA — Consultor de Negocios IA",
  description:
    "Asesoría empresarial impulsada por IA: sube documentos de tu empresa y obtén análisis, diagnósticos y gráficos interactivos.",
  icons: {
    icon: "/icono-cicia.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/icono-cicia.png" type="image/png" />
        <script dangerouslySetInnerHTML={{ __html: applyStoredThemeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
