import { ImportedResource } from 'app/Custom/interfaces'

export type ContentResource = Pick<ImportedResource, 'id' | 'uri' | 'template'>

/** Каждый селектор задаёт отдельный обязательный блок публичной страницы. */
const templateBlocks: ReadonlyMap<number, readonly string[]> = new Map([
  [0, ['body']], // Контент документа без шаблона.
  [
    1,
    [
      'body > section.zapravka',
      'body > header.container',
      'body > main.container',
    ],
  ],
  [2, ['body > main']], // Галерея.
  [4, ['body > main']], // Новости.
  [5, ['body > main']], // Услуги.
  [7, ['body > main']], // Статья.
  [8, ['body > header.container', 'body > main']], // Прайслист.
  [9, ['body > main']], // Контакты.
  [10, ['body > main']], // О нас.
  [11, ['body > header.container', 'body > main']], // Прайслист-печать.
  [14, ['body > main']], // Палитра.
  [15, ['body > main']], // Основной.
  [17, ['body > main']], // Прайс-элемент.
  [18, ['body > main']], // Услуга-Элемент-Галерея.
  [27, ['body > main']], // Галерея-элемент.
  [28, ['body > main']], // Галерея-категория.
  [29, ['body > main']], // Услуга Категория.
  [30, ['body > main']], // Категория магазина.
  [31, ['body > main']], // Товар.
  [33, ['body > main']], // Услуга-Галерея.
  [34, ['body > main.container']], // Галерея-элемент (полный).
  [35, ['body > main']], // Личный кабинет; публичный ответ может иметь статус 401.
  [36, ['body > main']], // Основной с ЛК и корзиной.
])

export function selectContentRoots(
  document: Document,
  resource: ContentResource,
  selector?: string,
): Element[] {
  const context = `Ресурс ${resource.id}, template=${resource.template}, URI=${resource.uri}`
  const blocks =
    selector === undefined ? templateBlocks.get(resource.template) : [selector]
  if (!blocks) {
    throw new Error(`${context}: не задано правило выбора контента для шаблона`)
  }
  for (const block of blocks) {
    const count = document.querySelectorAll(block).length
    if (count === 0 || (selector === undefined && count !== 1)) {
      throw new Error(
        `${context}: селектор "${block}" нашёл ${count} блоков; ожидалось ${selector === undefined ? 'ровно 1' : 'не менее 1'}`,
      )
    }
  }
  // Объединённый запрос сохраняет порядок блоков в исходном документе.
  return Array.from(document.querySelectorAll(blocks.join(', ')))
}
