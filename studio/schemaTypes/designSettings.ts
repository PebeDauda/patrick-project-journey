import {defineField, defineType} from 'sanity'
import {ColorWheelIcon} from '@sanity/icons/ColorWheel'

/**
 * Sitets designtokens: farvepalet og skriftpar, ét dokument for hele sitet
 * (ikke pr. sprog). Bundne valg fra en kurateret liste — ikke fri tekst
 * eller en farvevælger — så sitet ikke kan ødelægges visuelt fra editoren.
 */
export const designSettings = defineType({
  name: 'designSettings',
  title: 'Designindstillinger',
  type: 'document',
  icon: ColorWheelIcon,
  fields: [
    defineField({
      name: 'palette',
      title: 'Farvepalet',
      type: 'string',
      options: {
        list: [
          {title: 'Plum & Blush (standard)', value: 'plum-blush'},
          {title: 'Sand & Syre', value: 'sand-syre'},
        ],
        layout: 'radio',
      },
      initialValue: 'plum-blush',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'fontPairing',
      title: 'Skriftpar',
      type: 'string',
      options: {
        list: [
          {title: 'Klassisk (standard)', value: 'classic'},
          {title: 'Nutidig', value: 'contemporary'},
          {title: 'Struktureret', value: 'structured'},
        ],
        layout: 'radio',
      },
      initialValue: 'classic',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {palette: 'palette', fontPairing: 'fontPairing'},
    prepare({palette, fontPairing}) {
      return {
        title: 'Designindstillinger',
        subtitle: [palette, fontPairing].filter(Boolean).join(' · '),
      }
    },
  },
})
