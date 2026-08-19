export type Palette = "plum-blush" | "sand-syre";
export type FontPairing = "classic" | "contemporary" | "structured";

export const defaultDesignSettings: {palette: Palette; fontPairing: FontPairing} = {
  palette: "plum-blush",
  fontPairing: "classic",
};

const PALETTES: Palette[] = ["plum-blush", "sand-syre"];
const FONT_PAIRINGS: FontPairing[] = ["classic", "contemporary", "structured"];

export function isValidPalette(value: unknown): value is Palette {
  return typeof value === "string" && (PALETTES as string[]).includes(value);
}

export function isValidFontPairing(value: unknown): value is FontPairing {
  return typeof value === "string" && (FONT_PAIRINGS as string[]).includes(value);
}
