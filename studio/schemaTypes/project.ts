import {defineArrayMember, defineField, defineType} from 'sanity'
import {RocketIcon} from '@sanity/icons/Rocket'

/**
 * Et projektspor på projektoversigten.
 *
 * Dokumentet er sprogopdelt på samme måde som `content/projects.json`:
 * hvert projekt findes som ét dokument pr. sprog, bundet sammen af `projectId`.
 */
export const project = defineType({
  name: 'project',
  title: 'Projekt',
  type: 'document',
  icon: RocketIcon,
  groups: [
    {name: 'identity', title: 'Identitet', default: true},
    {name: 'story', title: 'Fortælling'},
    {name: 'progress', title: 'Fremdrift'},
  ],
  fields: [
    defineField({
      name: 'locale',
      title: 'Sprog',
      type: 'string',
      group: 'identity',
      options: {
        list: [
          {title: 'Dansk', value: 'da'},
          {title: 'English', value: 'en'},
        ],
        layout: 'radio',
      },
      initialValue: 'da',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'projectId',
      title: 'Teknisk ID',
      type: 'string',
      group: 'identity',
      description:
        'Deles af den danske og engelske udgave af samme projekt. Eksempel: portfolio, patrickos, career, creative.',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9-]+$/, {name: 'små bogstaver, tal og bindestreg'}),
    }),
    defineField({
      name: 'index',
      title: 'Nummer',
      type: 'string',
      group: 'identity',
      description: 'Rækkefølgen på oversigten, tocifret. Eksempel: 01.',
      validation: (rule) => rule.required().regex(/^\d{2}$/, {name: 'to cifre'}),
    }),
    defineField({
      name: 'title',
      title: 'Projektnavn',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategori',
      type: 'string',
      group: 'identity',
      description: 'Eksempel: Karriere · Førsteprioritet.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'accentColor',
      title: 'Accentfarve',
      type: 'string',
      group: 'identity',
      description: 'Hex-kode brugt som projektets farve på kortet. Eksempel: #f28ea2.',
      validation: (rule) =>
        rule.required().regex(/^#[0-9a-fA-F]{6}$/, {name: 'hex-farve som #rrggbb'}),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'progress',
      description: 'Eksempel: Aktiv nu / Active now.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'progress',
      title: 'Fremdrift (%)',
      type: 'number',
      group: 'progress',
      validation: (rule) => rule.required().min(0).max(100).integer(),
    }),
    defineField({
      name: 'milestones',
      title: 'Milepæle',
      type: 'array',
      group: 'progress',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'summary',
      title: 'Resumé',
      type: 'text',
      rows: 3,
      group: 'story',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'now',
      title: 'Hvor det står nu',
      type: 'text',
      rows: 4,
      group: 'story',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'next',
      title: 'Næste skridt',
      type: 'text',
      rows: 4,
      group: 'story',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'destination',
      title: 'Destination',
      type: 'text',
      rows: 4,
      group: 'story',
      description: 'Hvor projektet er på vej hen, når det lykkes.',
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: 'Nummer, stigende',
      name: 'indexAsc',
      by: [{field: 'index', direction: 'asc'}],
    },
    {
      title: 'Fremdrift, faldende',
      name: 'progressDesc',
      by: [{field: 'progress', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      locale: 'locale',
      index: 'index',
      status: 'status',
      progress: 'progress',
    },
    prepare({title, locale, index, status, progress}) {
      return {
        title: `${index ?? '··'} · ${title ?? 'Uden navn'}`,
        subtitle: [locale?.toUpperCase(), status, progress != null && `${progress} %`]
          .filter(Boolean)
          .join(' · '),
      }
    },
  },
})
