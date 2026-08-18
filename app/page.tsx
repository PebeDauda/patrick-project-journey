import projectsContent from "../content/projects.json";
import ProjectJourney, {type Locale, type Project} from "./project-journey";
import {sanityFetch} from "./sanity/live";
import {projectsQuery} from "./sanity/queries";

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

export default async function Home() {
  const projects = await loadProjects();

  return <ProjectJourney projects={projects} />;
}
