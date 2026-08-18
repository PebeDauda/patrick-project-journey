import {createClient} from 'next-sanity'

// Projekt-ID og dataset er offentlige værdier — de står i enhver klientforespørgsel
// mod Sanitys API og er hverken hemmeligheder eller miljøafhængige her.
export const projectId = 'niua6aq5'
export const dataset = 'production'
export const apiVersion = '2026-08-18'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Live Content API håndterer selv opdateringer, så CDN-caching ville kun
  // lægge et ekstra lag forsinkelse ind mellem redigering og visning.
  useCdn: false,
  stega: {
    // Stega indlejrer usynlige kildehenvisninger i teksten, så Presentation-værktøjet
    // kan pege fra et element på siden tilbage til feltet i Studio.
    studioUrl: 'https://patrick-project-journey.sanity.studio',
  },
})
