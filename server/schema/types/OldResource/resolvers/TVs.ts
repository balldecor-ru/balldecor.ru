import { builder } from '../../../builder'
import { OldTemplateValue } from '../../OldTemplateValue'
import type { OldTemplateValueRow } from '../../OldTemplateValue/interfaces'
import { OldResource } from '../types'

builder.objectField(OldResource, 'TVs', (t) =>
  t.field({
    type: [OldTemplateValue],
    nullable: false,
    resolve: (resource, _, ctx) =>
      ctx
        .knex<OldTemplateValueRow>('modx_site_tmplvar_contentvalues as value')
        .leftJoin('modx_site_tmplvars as tv', 'tv.id', 'value.tmplvarid')
        .select('value.*', 'tv.name')
        .where('value.contentid', resource.id)
        .orderBy('value.id'),
  }),
)
