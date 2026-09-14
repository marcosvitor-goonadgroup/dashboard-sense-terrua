import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";

import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sense · Terruá",
  description:
    "Resultados das pesquisas de satisfação dos eventos da Terruá, por matriz, evento e seção.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#e08a3a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
