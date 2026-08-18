import {defineEnableDraftMode} from 'next-sanity/draft-mode'

import {client} from '../../../sanity/client'

/**
 * Presentation-værktøjet i Studio kalder denne rute for at slå draft mode til.
 * Tokenet validerer kaldet, så en tilfældig besøgende ikke kan aktivere
 * kladdevisning.
 *
 * Uden token kan kladder ikke hentes, og draft mode giver ingen mening. Det
 * gælder fx ChatGPT Sites, hvor miljøvariabler ikke kan sættes. Ruten svarer
 * derfor 501 i stedet for at kaste en fejl og ende som en 500'er på en
 * offentlig side.
 */
const token = process.env.SANITY_API_READ_TOKEN

export const GET = token
  ? defineEnableDraftMode({client: client.withConfig({token})}).GET
  : async () =>
      new Response('Draft mode is not configured: SANITY_API_READ_TOKEN is missing.', {
        status: 501,
        headers: {'content-type': 'text/plain; charset=utf-8'},
      })
