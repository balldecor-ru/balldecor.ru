import type { ImportedResource } from '../../app/Custom/interfaces'

export function resourceVisibility(
  resource: ImportedResource,
  now: number = Math.floor(Date.now() / 1000),
): 'public' | 'hidden' | 'unpublished' {
  if (
    resource.published !== 1 ||
    resource.deleted !== 0 ||
    resource.privateweb !== 0 ||
    resource.context_key !== 'web' ||
    !['modDocument', 'modWebLink'].includes(resource.class_key) ||
    resource.pub_date > now ||
    (resource.unpub_date > 0 && resource.unpub_date <= now)
  ) {
    return 'unpublished'
  }
  return resource.hidemenu === 1 ? 'hidden' : 'public'
}
