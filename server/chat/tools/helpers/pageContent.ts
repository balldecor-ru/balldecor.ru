import type { Element, Root, RootContent } from 'hast'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'

const markdown = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)

const blockTags = new Set([
  'p',
  'div',
  'section',
  'article',
  'header',
  'footer',
  'blockquote',
  'ul',
  'ol',
  'dl',
  'dt',
  'dd',
  'figure',
  'figcaption',
  'pre',
])
const omittedTags = new Set(['script', 'style', 'template', 'noscript'])

function cellText(element: Element): string {
  return element.children.map(renderNode).join('').replace(/\s+/g, ' ').trim()
}

function renderTable(table: Element): string {
  const rows: Element[] = []
  const collectRows = (node: Element): void => {
    for (const child of node.children) {
      if (child.type !== 'element') {
        continue
      }
      if (child.tagName === 'tr') {
        rows.push(child)
      } else if (['thead', 'tbody', 'tfoot'].includes(child.tagName)) {
        collectRows(child)
      }
    }
  }
  collectRows(table)
  const grid: string[][] = []
  for (const [rowIndex, row] of rows.entries()) {
    grid[rowIndex] ??= []
    let column = 0
    for (const cell of row.children) {
      if (cell.type !== 'element' || !['td', 'th'].includes(cell.tagName)) {
        continue
      }
      while (grid[rowIndex][column] !== undefined) {
        column++
      }
      const span = (value: unknown): number =>
        typeof value === 'number' && Number.isInteger(value) && value > 0
          ? Math.min(value, 100)
          : 1
      const rowSpan = span(cell.properties.rowSpan)
      const colSpan = span(cell.properties.colSpan)
      const value = cellText(cell).replace(/\|/g, '\\|')
      for (let down = 0; down < rowSpan; down++) {
        grid[rowIndex + down] ??= []
        for (let across = 0; across < colSpan; across++) {
          grid[rowIndex + down][column + across] = value
        }
      }
      column += colSpan
    }
  }
  if (!grid.length) {
    return ''
  }
  const width = Math.max(...grid.map((row) => row.length))
  const line = (row: string[]): string =>
    '| ' +
    Array.from({ length: width }, (_, index) => row[index] ?? '').join(' | ') +
    ' |'
  const caption = table.children.find(
    (node) => node.type === 'element' && node.tagName === 'caption',
  )
  return (
    '\n\n' +
    (caption ? renderNode(caption) + '\n' : '') +
    [
      line(grid[0]),
      line(Array<string>(width).fill('---')),
      ...grid.slice(1).map(line),
    ].join('\n') +
    '\n\n'
  )
}

function renderNode(node: RootContent): string {
  if (node.type === 'text') {
    return node.value.replace(/\s+/g, ' ')
  }
  if (node.type !== 'element' || omittedTags.has(node.tagName)) {
    return ''
  }
  if (node.tagName === 'table') {
    return renderTable(node)
  }
  if (node.tagName === 'br') {
    return '\n'
  }
  if (node.tagName === 'hr') {
    return '\n\n---\n\n'
  }
  if (node.tagName === 'img') {
    return typeof node.properties.alt === 'string' ? node.properties.alt : ''
  }
  const content = node.children.map(renderNode).join('')
  if (/^h[1-6]$/.test(node.tagName)) {
    return (
      '\n\n' +
      '#'.repeat(Number(node.tagName[1])) +
      ' ' +
      content.trim() +
      '\n\n'
    )
  }
  if (node.tagName === 'li') {
    return '\n- ' + content.trim() + '\n'
  }
  if (node.tagName === 'a' && typeof node.properties.href === 'string') {
    return '[' + content.trim() + '](' + node.properties.href + ')'
  }
  return blockTags.has(node.tagName)
    ? '\n\n' + content.trim() + '\n\n'
    : content
}

export function pageContent(page: {
  contentMode: 'hast' | 'default'
  hast?: unknown
  content?: string | null
}): string {
  const tree =
    page.contentMode === 'default'
      ? markdown.runSync(markdown.parse(page.content ?? ''))
      : page.hast
  if (
    !tree ||
    typeof tree !== 'object' ||
    !('type' in tree) ||
    tree.type !== 'root' ||
    !('children' in tree) ||
    !Array.isArray(tree.children)
  ) {
    throw new Error('Для чтения страницы требуется корректное содержимое HAST')
  }
  return (tree as Root).children
    .map(renderNode)
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
