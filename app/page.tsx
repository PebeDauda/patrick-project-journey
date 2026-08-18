import projectsContent from "../content/projects.json";
import ProjectJourney, {
  fallbackCopy,
  type Copy,
  type Locale,
  type Project,
} from "./project-journey";
import {sanityFetch} from "./sanity/live";
import {pageContentQuery, projectsQuery} from "./sanity/queries";

const byLocale = (projects: Project[]): Record<Locale, Project[]> => ({
  da: projects.filter((project) => project.locale === "da"),
  en: projects.filter((project) => project.locale === "en"),
});

// Delvise data er værre end ingen data: så hellere falde tilbage til det
// indbyggede indhold end vise en oversigt med huller i.
const isComplete = (data: Record<Locale, Project[]>) =>
  Boolean(data.da.length && data.en.length);

async function loadProjects(): Promise<Record<Locale, Project[]>> {
  try {
    const {data} = await sanityFetch({query: projectsQuery});
    if (Array.isArray(data)) {
      const fromSanity = byLocale(data as Project[]);
      if (isComplete(fromSanity)) return fromSanity;
    }
  } catch {
    // Sanity utilgængelig — falder igennem til det indbyggede indhold nedenfor.
  }

  return byLocale(projectsContent as Project[]);
}

type SanityPageContent = Omit<Copy, "signals" | "steps"> & {
  locale: Locale;
  signals: {number: string; label: string}[] | null;
  steps: {title: string; description: string}[] | null;
};

/**
 * Sanity gemmer nøgletal og procestrin som navngivne objekter, fordi det er
 * tydeligere at redigere. Siden bruger par, så de foldes ud her.
 *
 * Flettes felt for felt hen over fallbacken, så ét manglende felt i Sanity
 * ikke efterlader et tomt hul på siden.
 */
function mergeCopy(entry: SanityPageContent, fallback: Copy): Copy {
  const defined = Object.fromEntries(
    Object.entries(entry).filter(([, value]) => value !== null && value !== undefined),
  );

  return {
    ...fallback,
    ...defined,
    signals: entry.signals?.length
      ? (entry.signals.map(({number, label}) => [number, label]) as [string, string][])
      : fallback.signals,
    steps: entry.steps?.length
      ? (entry.steps.map(({title, description}) => [title, description]) as [
          string,
          string,
        ][])
      : fallback.steps,
  };
}

async function loadCopy(): Promise<Record<Locale, Copy>> {
  try {
    const {data} = await sanityFetch({query: pageContentQuery});
    if (Array.isArray(data)) {
      const entries = data as SanityPageContent[];
      return {
        da: mergeCopy(
          entries.find((entry) => entry.locale === "da") ?? ({} as SanityPageContent),
          fallbackCopy.da,
        ),
        en: mergeCopy(
          entries.find((entry) => entry.locale === "en") ?? ({} as SanityPageContent),
          fallbackCopy.en,
        ),
      };
    }
  } catch {
    // Sanity utilgængelig — siden bruger den indbyggede tekst.
  }

  return fallbackCopy;
}

export default async function Home() {
  const [projects, copy] = await Promise.all([loadProjects(), loadCopy()]);

  return <ProjectJourney projects={projects} copy={copy} />;
}
