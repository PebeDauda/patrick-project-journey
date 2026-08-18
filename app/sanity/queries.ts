import {defineQuery} from 'next-sanity'

// Feltnavnene i Sanity er modelleret efter indholdet, ikke efter sitet, så
// projektionerne oversætter til den form, komponenterne allerede bruger.

export const projectsQuery = defineQuery(`*[_type == "project"] | order(index asc){
  locale, "id": projectId, index, title, category, status, progress,
  "accent": accentColor, summary, now, next, destination, milestones
}`)

export const pageContentQuery = defineQuery(`*[_type == "pageContent"]{
  locale,
  control, heroA, heroB, heroEm, intro,
  signals[]{number, label}, focus,
  map, building, choose, now, next, destination, estimate,
  method, process, steps[]{title, description},
  long, door, motor, vision, visionLine,
  nav, updated, footer, see, sections, theme
}`)
