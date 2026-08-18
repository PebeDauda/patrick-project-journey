import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

/**
 * Al fast tekst på forsiden, ét dokument pr. sprog.
 *
 * Projektkortene ligger i `project`. Dette dokument dækker alt det andet:
 * hero, nøgletal, sektionsoverskrifter, proces, vision og footer.
 *
 * Felterne er grupperet efter sidens sektioner, så rækkefølgen i editoren
 * følger rækkefølgen på siden.
 */
export const pageContent = defineType({
  name: 'pageContent',
  title: 'Sideindhold',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'hero', title: 'Hero', default: true},
    {name: 'signals', title: 'Nøgletal'},
    {name: 'projects', title: 'Projekter'},
    {name: 'process', title: 'Proces'},
    {name: 'vision', title: 'Vision'},
    {name: 'chrome', title: 'Menu og footer'},
  ],
  fields: [
    defineField({
      name: 'locale',
      title: 'Sprog',
      type: 'string',
      group: 'hero',
      options: {
        list: [
          {title: 'Dansk', value: 'da'},
          {title: 'English', value: 'en'},
        ],
        layout: 'radio',
      },
      readOnly: true,
      validation: (rule) => rule.required(),
    }),

    // Hero
    defineField({
      name: 'control',
      title: 'Lille tekst øverst',
      type: 'string',
      group: 'hero',
      description: 'Eksempel: PROJEKTKONTROL / 2026',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroA',
      title: 'Overskrift, linje 1',
      type: 'string',
      group: 'hero',
      description: 'Eksempel: Fra løse idéer',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroB',
      title: 'Overskrift, linje 2',
      type: 'string',
      group: 'hero',
      description: 'Står før det fremhævede ord. Eksempel: til et',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroEm',
      title: 'Fremhævet ord',
      type: 'string',
      group: 'hero',
      description: 'Vises i kursiv til sidst i overskriften. Eksempel: system.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'intro',
      title: 'Introtekst',
      type: 'text',
      rows: 3,
      group: 'hero',
      validation: (rule) => rule.required(),
    }),

    // Nøgletal
    defineField({
      name: 'signals',
      title: 'Nøgletal',
      type: 'array',
      group: 'signals',
      description: 'De tre tal i det farvede bånd. Præcis tre.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'signal',
          fields: [
            defineField({
              name: 'number',
              title: 'Tal',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Tekst',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {title: 'number', subtitle: 'label'},
          },
        }),
      ],
      validation: (rule) => rule.required().length(3),
    }),
    defineField({
      name: 'focus',
      title: 'Fokus-sætning',
      type: 'text',
      rows: 3,
      group: 'signals',
      validation: (rule) => rule.required(),
    }),

    // Projektsektionen
    defineField({
      name: 'map',
      title: 'Sektionsmærkat',
      type: 'string',
      group: 'projects',
      description: 'Eksempel: 01 / PROJEKTKORT',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'building',
      title: 'Sektionsoverskrift',
      type: 'string',
      group: 'projects',
      description: 'Eksempel: Det vi bygger',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'choose',
      title: 'Sektionsbeskrivelse',
      type: 'text',
      rows: 2,
      group: 'projects',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'now',
      title: 'Etiket: Nu',
      type: 'string',
      group: 'projects',
      description: 'Overskriften over "hvor det står nu" inde i et projektkort.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'next',
      title: 'Etiket: Næste bevægelse',
      type: 'string',
      group: 'projects',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'destination',
      title: 'Etiket: Destination',
      type: 'string',
      group: 'projects',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'estimate',
      title: 'Forbehold om fremdriftstal',
      type: 'text',
      rows: 2,
      group: 'projects',
      validation: (rule) => rule.required(),
    }),

    // Proces
    defineField({
      name: 'method',
      title: 'Sektionsmærkat',
      type: 'string',
      group: 'process',
      description: 'Eksempel: 02 / METODEN',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'process',
      title: 'Sektionsoverskrift',
      type: 'string',
      group: 'process',
      description: 'Eksempel: Processen er produktet',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'steps',
      title: 'Procestrin',
      type: 'array',
      group: 'process',
      description: 'De fem trin. Rækkefølgen på siden følger rækkefølgen her.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({
              name: 'title',
              title: 'Trinnets navn',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Beskrivelse',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'description'},
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),

    // Vision
    defineField({
      name: 'long',
      title: 'Sektionsmærkat',
      type: 'string',
      group: 'vision',
      description: 'Eksempel: 03 / LANGSIGTET RETNING',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'door',
      title: 'Udsagn 1',
      type: 'string',
      group: 'vision',
      description: 'Eksempel: Porteføljen åbner døren.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'motor',
      title: 'Udsagn 2',
      type: 'string',
      group: 'vision',
      description: 'Eksempel: PatrickOS bygger motoren.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'vision',
      title: 'Visionstekst',
      type: 'text',
      rows: 4,
      group: 'vision',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'visionLine',
      title: 'De tre trin nederst',
      type: 'array',
      group: 'vision',
      description: 'Eksempel: PERSONLIGT BEVIS · GENBRUGELIGT SYSTEM · VIRKELIG EFFEKT',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().length(3),
    }),

    // Menu og footer
    defineField({
      name: 'nav',
      title: 'Menupunkter',
      type: 'array',
      group: 'chrome',
      description: 'De tre links i topmenuen. Præcis tre.',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().length(3),
    }),
    defineField({
      name: 'updated',
      title: 'Opdateret-mærkat',
      type: 'string',
      group: 'chrome',
      description: 'Eksempel: Opdateret 18.08.26',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'footer',
      title: 'Footer-tekst',
      type: 'string',
      group: 'chrome',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'see',
      title: 'Skærmlæser: pil ned',
      type: 'string',
      group: 'chrome',
      description: 'Skjult tekst for skærmlæsere. Eksempel: Se projekterne',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Skærmlæser: menu',
      type: 'string',
      group: 'chrome',
      description: 'Skjult tekst for skærmlæsere. Eksempel: Sidens sektioner',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'theme',
      title: 'Skærmlæser: temaknap',
      type: 'string',
      group: 'chrome',
      description: 'Skjult tekst for skærmlæsere. Eksempel: Skift farvetema',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {locale: 'locale', heroA: 'heroA', heroEm: 'heroEm'},
    prepare({locale, heroA, heroEm}) {
      return {
        title: locale === 'en' ? 'Sideindhold · English' : 'Sideindhold · Dansk',
        subtitle: [heroA, heroEm].filter(Boolean).join(' … '),
      }
    },
  },
})
