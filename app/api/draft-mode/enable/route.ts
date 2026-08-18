import {defineEnableDraftMode} from 'next-sanity/draft-mode'

import {client} from '../../../sanity/client'

/**
 * Presentation-værktøjet i Studio kalder denne rute for at slå draft mode til.
 * Tokenet validerer kaldet, så en tilfældig besøgende ikke kan aktivere kladdevisning.
 */
export const {GET} = defineEnableDraftMode({
  client: client.withConfig({token: process.env.SANITY_API_READ_TOKEN}),
})
