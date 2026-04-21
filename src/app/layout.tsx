import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Samuel Lucas",
    template: "%s | Samuel Lucas",
  },
  description: "Blog moderno com foco em segurança, performance e SEO.",
  openGraph: {
    title: "Samuel Lucas",
    description: "Leitura e escrita com qualidade editorial e arquitetura robusta.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samuel Lucas",
    description: "Leitura e escrita com qualidade editorial e arquitetura robusta.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
