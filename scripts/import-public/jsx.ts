import { fromDom } from 'hast-util-from-dom'
import { toEstree } from 'hast-util-to-estree'
import { jsx, toJs } from 'estree-util-to-js'
import { visit } from 'estree-util-visit'
import { find, html } from 'property-information'
import type { Root } from 'hast'
import type { Comment } from 'estree'
import type { JSXEmptyExpression } from 'estree-jsx'

/** Генерируем исходник JSX; в браузере HTML повторно не разбирается. */
export function contentToJsx(roots: Element[]): string {
  const tree: Root = { type: 'root', children: [] }
  for (const root of roots) {
    const node = fromDom(root)
    if (node.type === 'element') {
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
  }
  const program = toEstree(tree, {
    elementAttributeNameCase: 'react',
    tableCellAlignToStyle: false,
  })
  // Комментарии исходной страницы сохраняются на своих местах, включая */.
  delete program.comments
  visit(program, (node) => {
    if (node.type === 'JSXElement') {
      const opening = node.openingElement
      if (opening.name.type !== 'JSXIdentifier') {
        return
      }
      let name = opening.name.name
      if (name === 'noindex') {
        name = 'NoIndex'
      }
      if (name === 'a') {
        const href = opening.attributes.find(
          (attribute) =>
            attribute.type === 'JSXAttribute' &&
            attribute.name.type === 'JSXIdentifier' &&
            attribute.name.name === 'href',
        )
        if (
          href?.type === 'JSXAttribute' &&
          href.value?.type === 'Literal' &&
          typeof href.value.value === 'string' &&
          href.value.value.startsWith('/')
        ) {
          name = 'Link'
          href.name = { type: 'JSXIdentifier', name: 'to' }
        }
      }
      opening.name.name = name
      if (node.closingElement?.name.type === 'JSXIdentifier') {
        node.closingElement.name.name = name
      }
    }
    if (node.type !== 'JSXAttribute' || node.value?.type !== 'Literal') {
      return
    }
    const value = node.value.value
    const asset =
      typeof value === 'string' && /^__IMPORTED_(asset\d+)__$/.exec(value)
    if (asset) {
      node.value = {
        type: 'JSXExpressionContainer',
        expression: {
          type: 'MemberExpression',
          computed: true,
          optional: false,
          object: { type: 'Identifier', name: 'importedAssets' },
          property: { type: 'Literal', value: asset[1] },
        },
      }
    } else if (
      node.name.type === 'JSXIdentifier' &&
      find(html, node.name.name).number &&
      !find(html, node.name.name).commaSeparated &&
      !find(html, node.name.name).spaceSeparated
    ) {
      const number = Number(value)
      if (!Number.isFinite(number)) {
        return
      }
      node.value = {
        type: 'JSXExpressionContainer',
        expression: { type: 'Literal', value: number },
      }
    }
  })
  // Spread сохраняет устаревшие HTML-атрибуты (например, align),
  // отсутствующие в React typings. Имена и значения уже преобразованы библиотекой.
  visit(program, (node) => {
    if (node.type !== 'JSXOpeningElement') {
      return
    }
    node.attributes = node.attributes.map((attribute) => {
      if (
        attribute.type !== 'JSXAttribute' ||
        attribute.name.type !== 'JSXIdentifier'
      ) {
        return attribute
      }
      const value = attribute.value
      if (
        value?.type === 'JSXElement' ||
        value?.type === 'JSXFragment' ||
        (value?.type === 'JSXExpressionContainer' &&
          value.expression.type === 'JSXEmptyExpression')
      ) {
        return attribute
      }
      const expression =
        value?.type === 'JSXExpressionContainer' ? value.expression : value
      if (expression?.type === 'JSXEmptyExpression') {
        return attribute
      }
      return {
        type: 'JSXSpreadAttribute',
        argument: {
          type: 'ObjectExpression',
          properties: [
            {
              type: 'Property',
              method: false,
              shorthand: false,
              computed: false,
              kind: 'init',
              key: { type: 'Literal', value: attribute.name.name },
              value: expression ?? { type: 'Literal', value: true },
            },
          ],
        },
      }
    })
  })
  return toJs(program, {
    handlers: {
      ...jsx,
      JSXEmptyExpression(
        node: JSXEmptyExpression & { comments?: Comment[] },
        state,
      ) {
        for (const comment of node.comments ?? []) {
          state.write(`/*${comment.value.replaceAll('*/', '* /')}*/`)
        }
      },
    },
  })
    .value.trim()
    .replace(/;$/, '')
}
