/** Исходные признаки MODX. Контент хранится непосредственно в компоненте. */
export interface ImportedResource {
  id: number
  uri: string | null
  published: number
  searchable: number
  hidemenu: number
  deleted: number
  privateweb: number
  parent: number
  template: number
  context_key: string
  class_key: string
  pub_date: number
  unpub_date: number
}

export interface ImportedRoute {
  id: number
  path: string
  file: string
}

export interface ImportedRedirect {
  location: string
  status: number
  noindex: boolean
}
