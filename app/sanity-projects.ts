/**
 * Henter projektdata live fra Sanity, så redigeringer i Studio slår igennem på
 * sitet uden et nyt build. Fejler kaldet — projektet deaktiveret, netværket nede,
 * data ufuldstændige — returneres null, og `page.tsx` bliver på sit indbyggede
 * indhold fra `content/projects.json`.
 */

type Locale = "da" | "en";

export type SanityProject = {
  locale: Locale;
  id: string;
  index: string;
  title: string;
  category: string;
  status: string;
  progress: number;
  accent: string;
  summary: string;
  now: string;
  next: string;
  destination: string;
  milestones: string[];
};

// Projekt-ID og dataset er offentlige værdier — de står i enhver klient-forespørgsel
// mod Sanitys CDN og er hverken hemmeligheder eller miljøafhængige her.
const PROJECT_ID = "z53cymkz";
const DATASET = "production";
const API_VERSION = "2026-08-18";

// Feltnavnene i Sanity er modelleret efter indholdet, ikke efter sitet, så
// projektionen oversætter til den form `page.tsx` allerede bruger.
const QUERY = `*[_type == "project"] | order(index asc){
  locale, "id": projectId, index, title, category, status, progress,
  "accent": accentColor, summary, now, next, destination, milestones
}`;

const isProject = (value: unknown): value is SanityProject => {
  const p = value as Partial<SanityProject> | null;
  return Boolean(
    p &&
      (p.locale === "da" || p.locale === "en") &&
      typeof p.id === "string" &&
      typeof p.index === "string" &&
      typeof p.title === "string" &&
      typeof p.category === "string" &&
      typeof p.status === "string" &&
      typeof p.progress === "number" &&
      typeof p.accent === "string" &&
      typeof p.summary === "string" &&
      typeof p.now === "string" &&
      typeof p.next === "string" &&
      typeof p.destination === "string" &&
      Array.isArray(p.milestones) &&
      p.milestones.every((m) => typeof m === "string"),
  );
};

export async function fetchSanityProjects(
  signal?: AbortSignal,
): Promise<Record<Locale, SanityProject[]> | null> {
  try {
    // apicdn er det cachede, offentlige endpoint — ingen token, ingen afhængigheder.
    const url =
      `https://${PROJECT_ID}.apicdn.sanity.io/v${API_VERSION}/data/query/${DATASET}` +
      `?query=${encodeURIComponent(QUERY)}`;

    const response = await fetch(url, {signal});
    if (!response.ok) return null;

    const body: unknown = await response.json();
    const result = (body as {result?: unknown})?.result;
    if (!Array.isArray(result)) return null;

    const projects = result.filter(isProject);
    const da = projects.filter((p) => p.locale === "da");
    const en = projects.filter((p) => p.locale === "en");

    // Delvise data er værre end ingen data: falder hellere tilbage til det
    // indbyggede indhold end at vise en oversigt med huller i.
    if (!da.length || !en.length) return null;

    return {da, en};
  } catch {
    return null;
  }
}
