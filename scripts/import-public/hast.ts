import { fromDom } from 'hast-util-from-dom'
import type { Root } from 'hast'

export function contentToHast(roots: Element[]): Root {
  const tree: Root = { type: 'root', children: [] }
  for (const root of roots) {
    const node = fromDom(root)
    if (node.type !== 'element') {
      continue
    }
    if (node.tagName === 'body') {
      tree.children.push(...node.children)
    } else {
      // Общий Layout уже содержит main; вложенный main недопустим.
      if (node.tagName === 'main') {
        node.tagName = 'div'
      }
      tree.children.push(node)
    }
  }
  return tree
}
