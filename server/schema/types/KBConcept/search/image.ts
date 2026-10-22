import type { Root, Element } from 'hast'

export function conceptSearchImage(concept: {
  hast: unknown
  image: string | null
}): string | null {
  // Импорт сохраняет фактически использованные изображения страницы вместе с HAST.
  const visit = (node: Root | Element): string | null => {
    if (node.type === 'element' && node.tagName === 'img') {
      const src = node.properties?.src
      if (
        typeof src === 'string' &&
        src.startsWith('/') &&
        !src.startsWith('//')
      ) {
        return src
      }
    }
    for (const child of node.children ?? []) {
      if (child.type === 'element') {
        const image = visit(child)
        if (image) {
          return image
        }
      }
    }
    return null
  }
  const tree = concept.hast as Root | null
  return (tree?.type === 'root' ? visit(tree) : null) ?? concept.image
}
