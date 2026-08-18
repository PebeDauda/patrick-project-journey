import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {presentationTool} from 'sanity/presentation'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: "Patrick's Project Journey",

  projectId: 'niua6aq5',
  dataset: 'production',

  plugins: [
    presentationTool({
      previewUrl: {
        // Skift til produktions-URL'en, når Sites-udgivelsen er verificeret.
        origin: process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:5173',
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
    }),
    structureTool({structure}),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    templates: (prev) => [
      ...prev,
      {
        id: 'project-by-locale',
        title: 'Projekt med sprog',
        schemaType: 'project',
        parameters: [{name: 'locale', type: 'string'}],
        value: ({locale}: {locale: string}) => ({locale}),
      },
    ],
  },
})
