import {defineLive} from 'next-sanity/live'

import {client} from './client'

/**
 * `sanityFetch` henter indhold på serveren, og `<SanityLive />` holder det
 * opdateret uden genindlæsning. Uden tokens dækker det udgivet indhold;
 * med tokens kan kladder også vises i draft mode.
 */
export const {sanityFetch, SanityLive} = defineLive({
  client,
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.SANITY_API_READ_TOKEN,
})
