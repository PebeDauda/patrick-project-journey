import type { Metadata } from "next";
import "./globals.css";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

import { SanityLive } from "./sanity/live";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {isEnabled: isDraftMode} = await draftMode();

  return (
    <html lang="da">
      <body className="antialiased">
        {children}
        {/* Holder indhold hentet med sanityFetch opdateret uden genindlæsning. */}
        <SanityLive />
        {/* Klik-til-redigering. Kun i draft mode, så almindelige besøgende ikke påvirkes. */}
        {isDraftMode && <VisualEditing />}
      </body>
    </html>
  );
}
