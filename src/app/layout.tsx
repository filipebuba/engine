import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Edital Match - Encontre o Edital Ideal para sua Empresa",
  description:
    "Plataforma inteligente que conecta empresas a editais de fomento, subsídios e incentivos fiscais. Aumente suas chances de aprovação com matching por IA.",
  keywords: [
    "edital",
    "fomento",
    "subsidio",
    "incentivo fiscal",
    "licitação",
    "empresa",
    "MEI",
    "ME",
    "EPP",
  ],
  openGraph: {
    title: "Edital Match",
    description:
      "Encontre o edital ideal para sua empresa com matching inteligente por IA.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
