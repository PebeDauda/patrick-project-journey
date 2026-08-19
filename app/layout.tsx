import type { Metadata } from "next";
import "./globals.css";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

import {
  defaultDesignSettings,
  isValidFontPairing,
  isValidPalette,
} from "./design-settings";
import { SanityLive, sanityFetch } from "./sanity/live";
import { designSettingsQuery } from "./sanity/queries";

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

async function loadDesignSettings() {
  try {
    const {data} = await sanityFetch({query: designSettingsQuery});
    if (data) {
      return {
        palette: isValidPalette(data.palette) ? data.palette : defaultDesignSettings.palette,
        fontPairing: isValidFontPairing(data.fontPairing)
          ? data.fontPairing
          : defaultDesignSettings.fontPairing,
      };
    }
  } catch {
    // Sanity utilgængelig — siden bruger de indbyggede designindstillinger.
  }

  return defaultDesignSettings;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const {isEnabled: isDraftMode} = await draftMode();
  const {palette, fontPairing} = await loadDesignSettings();

  return (
    <html lang="da" data-palette={palette} data-font={fontPairing}>
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
