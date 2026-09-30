import { builder } from '../../builder'
import type { OldTemplateValueRow } from './interfaces'

export const OldTemplateValue = builder
  .objectRef<OldTemplateValueRow>('OldTemplateValue')
  .implement({
    fields: (t) => ({
      id: t.exposeInt('id', { nullable: false }),
      tmplvarid: t.exposeInt('tmplvarid', { nullable: false }),
      contentid: t.exposeInt('contentid', { nullable: false }),
      value: t.exposeString('value', { nullable: false }),
      name: t.exposeString('name', { nullable: true }),
    }),
  })
