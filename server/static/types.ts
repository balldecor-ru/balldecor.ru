export interface StaticPage {
  path: string
  status: number
  noindex: boolean
  redirect?: { location: string; status: number }
}

export function pagePath(path: string): string {
  return path.replace(/\/+$/, '') || '/'
}
