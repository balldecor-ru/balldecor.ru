import { builder } from '../../builder'
import { OldResource } from './types'

import './resolvers/oldResource'
import './resolvers/oldResources'
import './resolvers/oldResourcesCount'
import './resolvers/TVs'

builder.objectType(OldResource, {
  fields: (t) => ({
    type: t.exposeString('type', { nullable: false }),
    contentType: t.exposeString('contentType', { nullable: false }),
    pagetitle: t.exposeString('pagetitle', { nullable: false }),
    longtitle: t.exposeString('longtitle', { nullable: false }),
    description: t.exposeString('description', { nullable: false }),
    link_attributes: t.exposeString('link_attributes', { nullable: false }),
    menutitle: t.exposeString('menutitle', { nullable: false }),
    class_key: t.exposeString('class_key', { nullable: false }),
    context_key: t.exposeString('context_key', { nullable: false }),
    price: t.exposeString('price', { nullable: false }),
    alias: t.exposeString('alias', { nullable: true }),
    introtext: t.exposeString('introtext', { nullable: true }),
    content: t.exposeString('content', { nullable: true }),
    uri: t.exposeString('uri', { nullable: true }),
    properties: t.exposeString('properties', { nullable: true }),
    article: t.exposeString('article', { nullable: true }),
    externalKey: t.exposeString('externalKey', { nullable: true }),
    id: t.exposeInt('id', { nullable: false }),
    published: t.exposeInt('published', { nullable: false }),
    pub_date: t.exposeInt('pub_date', { nullable: false }),
    unpub_date: t.exposeInt('unpub_date', { nullable: false }),
    parent: t.exposeInt('parent', { nullable: false }),
    isfolder: t.exposeInt('isfolder', { nullable: false }),
    richtext: t.exposeInt('richtext', { nullable: false }),
    template: t.exposeInt('template', { nullable: false }),
    menuindex: t.exposeInt('menuindex', { nullable: false }),
    searchable: t.exposeInt('searchable', { nullable: false }),
    cacheable: t.exposeInt('cacheable', { nullable: false }),
    createdby: t.exposeInt('createdby', { nullable: false }),
    createdon: t.exposeInt('createdon', { nullable: false }),
    editedby: t.exposeInt('editedby', { nullable: false }),
    editedon: t.exposeInt('editedon', { nullable: false }),
    deleted: t.exposeInt('deleted', { nullable: false }),
    deletedon: t.exposeInt('deletedon', { nullable: false }),
    deletedby: t.exposeInt('deletedby', { nullable: false }),
    publishedon: t.exposeInt('publishedon', { nullable: false }),
    publishedby: t.exposeInt('publishedby', { nullable: false }),
    donthit: t.exposeInt('donthit', { nullable: false }),
    privateweb: t.exposeInt('privateweb', { nullable: false }),
    privatemgr: t.exposeInt('privatemgr', { nullable: false }),
    content_dispo: t.exposeInt('content_dispo', { nullable: false }),
    hidemenu: t.exposeInt('hidemenu', { nullable: false }),
    content_type: t.exposeInt('content_type', { nullable: false }),
    uri_override: t.exposeInt('uri_override', { nullable: false }),
    hide_children_in_tree: t.exposeInt('hide_children_in_tree', {
      nullable: false,
    }),
    show_in_tree: t.exposeInt('show_in_tree', { nullable: false }),
    alias_visible: t.exposeInt('alias_visible', { nullable: false }),
    currency: t.exposeInt('currency', { nullable: true }),
    importId: t.exposeInt('importId', { nullable: true }),
  }),
})
