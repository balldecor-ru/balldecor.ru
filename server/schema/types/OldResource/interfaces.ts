export interface OldResourceRow {
  type: string
  contentType: string
  pagetitle: string
  longtitle: string
  description: string
  link_attributes: string
  menutitle: string
  class_key: string
  context_key: string
  alias: string | null
  introtext: string | null
  content: string | null
  uri: string | null
  properties: string | null
  article: string | null
  externalKey: string | null
  id: number
  published: number
  pub_date: number
  unpub_date: number
  parent: number
  isfolder: number
  richtext: number
  template: number
  menuindex: number
  searchable: number
  cacheable: number
  createdby: number
  createdon: number
  editedby: number
  editedon: number
  deleted: number
  deletedon: number
  deletedby: number
  publishedon: number
  publishedby: number
  donthit: number
  privateweb: number
  privatemgr: number
  content_dispo: number
  hidemenu: number
  content_type: number
  uri_override: number
  hide_children_in_tree: number
  show_in_tree: number
  alias_visible: number
  currency: number | null
  importId: number | null
  price: string
}

export interface ResourceFilter {
  id?: number | null
  uri?: string | null
  parent?: number | null
  template?: number | null
  published?: number | null
  deleted?: number | null
  context_key?: string | null
  class_key?: string | null
}
