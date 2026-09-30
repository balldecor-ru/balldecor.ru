import type { NormalizedCacheObject } from '@apollo/client'

// Сохраняем поля ROOT_QUERY предыдущих страниц при SPA-переходах.
// Входящие поля и массивы целиком заменяют предыдущие значения.
export function mergeApolloState(
  existing: NormalizedCacheObject,
  incoming: NormalizedCacheObject,
): NormalizedCacheObject {
  const merged: NormalizedCacheObject = { ...existing }
  for (const [key, value] of Object.entries(incoming)) {
    merged[key] = { ...existing[key], ...value }
  }
  return merged
}
