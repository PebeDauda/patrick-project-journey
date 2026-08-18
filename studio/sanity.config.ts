import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: "Patrick's Project Journey",

  projectId: 'z53cymkz',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

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
