import type React from 'react'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'
import { Link } from 'react-router'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import type { Root } from 'hast'

const Anchor: React.FC<
  React.ComponentProps<'a'> & { 'data-toggle'?: string; 'data-target'?: string }
> = ({ href, ...props }) => {
  if (
    !href &&
    props['data-toggle'] === 'modal' &&
    ['#callback', '#LoginModal'].includes(props['data-target'] ?? '')
  ) {
    return <a {...props} href={props['data-target']} />
  }
  return href?.startsWith('/') && !href.startsWith('//') ? (
    <Link {...props} to={href} />
  ) : (
    <a {...props} href={href} />
  )
}

export const Hast: React.FC<{ tree: unknown }> = ({ tree }) => {
  if (
    !tree ||
    typeof tree !== 'object' ||
    !('type' in tree) ||
    tree.type !== 'root' ||
    !('children' in tree) ||
    !Array.isArray(tree.children)
  ) {
    throw new Error('Некорректное дерево HAST')
  }
  return toJsxRuntime(tree as Root, {
    Fragment,
    jsx,
    jsxs,
    components: { a: Anchor },
    elementAttributeNameCase: 'react',
    tableCellAlignToStyle: false,
  })
}
