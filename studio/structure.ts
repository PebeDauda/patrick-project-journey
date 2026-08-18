import type {StructureResolver} from 'sanity/structure'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {RocketIcon} from '@sanity/icons/Rocket'

/**
 * Indholdet grupperes efter sprog, så dansk og engelsk redigeres hver for sig.
 *
 * Sideindholdet er ét fast dokument pr. sprog med kendt id, så det åbnes
 * direkte i stedet for gennem en liste med ét element.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Indhold')
    .items([
      S.listItem()
        .title('Sideindhold · Dansk')
        .icon(DocumentTextIcon)
        .child(
          S.document()
            .schemaType('pageContent')
            .documentId('pageContent-da')
            .title('Sideindhold · Dansk'),
        ),
      S.listItem()
        .title('Sideindhold · English')
        .icon(DocumentTextIcon)
        .child(
          S.document()
            .schemaType('pageContent')
            .documentId('pageContent-en')
            .title('Sideindhold · English'),
        ),
      S.divider(),
      S.listItem()
        .title('Projekter · Dansk')
        .icon(RocketIcon)
        .child(
          S.documentList()
            .title('Projekter · Dansk')
            .filter('_type == "project" && locale == "da"')
            .defaultOrdering([{field: 'index', direction: 'asc'}])
            .initialValueTemplates([
              S.initialValueTemplateItem('project-by-locale', {locale: 'da'}),
            ]),
        ),
      S.listItem()
        .title('Projekter · English')
        .icon(RocketIcon)
        .child(
          S.documentList()
            .title('Projekter · English')
            .filter('_type == "project" && locale == "en"')
            .defaultOrdering([{field: 'index', direction: 'asc'}])
            .initialValueTemplates([
              S.initialValueTemplateItem('project-by-locale', {locale: 'en'}),
            ]),
        ),
    ])
