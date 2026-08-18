import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patrick's Project Journey",
  description: "Et levende overblik over Patricks projekter, processen og den langsigtede retning.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body className="antialiased">{children}</body>
    </html>
  );
}
