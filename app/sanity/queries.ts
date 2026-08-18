import {defineQuery} from 'next-sanity'

// Feltnavnene i Sanity er modelleret efter indholdet, ikke efter sitet, så
// projektionen oversætter til den form, komponenterne allerede bruger.
export const projectsQuery = defineQuery(`*[_type == "project"] | order(index asc){
  locale, "id": projectId, index, title, category, status, progress,
  "accent": accentColor, summary, now, next, destination, milestones
}`)
