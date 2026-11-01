#!/usr/bin/env node
// @ts-check
import { readFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import chalk from 'chalk'
import { JSDOM } from 'jsdom'

/** @param {string} xml @param {string} source */
function readPathnames(xml, source) {
  const dom = new JSDOM(xml, { contentType: 'text/xml' })
  try {
    const root = dom.window.document.documentElement
    if (root.localName !== 'urlset') {
      throw new Error(`${source}: ожидался sitemap с корневым элементом urlset`)
    }
    const paths = new Set()
    for (const entry of root.children) {
      if (entry.localName !== 'url') continue
      const location = Array.from(entry.children)
        .find((child) => child.localName === 'loc')
        ?.textContent?.trim()
      if (!location)
        throw new Error(`${source}: у элемента url отсутствует loc`)
      paths.add(new URL(location).pathname)
    }
    return paths
  } finally {
    dom.window.close()
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      old: {
        type: 'string',
        default: '/shared/www/balldecor.ru/old_site/site/sitemap.xml',
      },
      url: { type: 'string', default: 'http://localhost:3000/sitemap.xml' },
      help: { type: 'boolean', short: 'h' },
    },
  })
  if (values.help) {
    console.log(`Сравнение sitemap только по pathname (без домена, query и hash).
Запуск: node scripts/compare-sitemaps.mjs [--old <локальный файл>] [--url <URL нового sitemap>]
Потерянные пути — красные (-), добавленные — зелёные (+).
Коды выхода: 0 — совпадение, 1 — различия, 2 — ошибка чтения или разбора.`)
    return
  }

  const oldXml = await readFile(values.old, 'utf8')
  const response = await globalThis.fetch(values.url, {
    signal: globalThis.AbortSignal.timeout(30_000),
  })
  if (!response.ok) {
    throw new Error(
      `${values.url}: HTTP ${response.status} ${response.statusText}`,
    )
  }
  const oldPaths = readPathnames(oldXml, values.old)
  const newPaths = readPathnames(await response.text(), values.url)
  const missing = [...oldPaths].filter((path) => !newPaths.has(path)).sort()
  const added = [...newPaths].filter((path) => !oldPaths.has(path)).sort()

  console.log(
    `Уникальных pathname: старый sitemap — ${oldPaths.size}, новый — ${newPaths.size}`,
  )
  console.log(chalk.red(`\nПотерянные: ${missing.length}`))
  for (const path of missing) console.log(chalk.red(`- ${path}`))
  console.log(chalk.green(`\nДобавленные: ${added.length}`))
  for (const path of added) console.log(chalk.green(`+ ${path}`))
  console.log(`\nСовпадают: ${oldPaths.size - missing.length}`)
  process.exitCode = missing.length || added.length ? 1 : 0
}

main().catch((error) => {
  console.error(chalk.red(`Ошибка: ${error.message}`))
  process.exitCode = 2
})
