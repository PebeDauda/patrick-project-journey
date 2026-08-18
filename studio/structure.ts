import type {StructureResolver} from 'sanity/structure'
import {RocketIcon} from '@sanity/icons/Rocket'

/**
 * Projekterne grupperes efter sprog, så dansk og engelsk indhold
 * redigeres hver for sig — samme opdeling som i Front Matter.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Indhold')
    .items([
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
