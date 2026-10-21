import { test, expect } from '@playwright/test'

const galleryPath =
  '/services/kalendarnie-prazdniki/galereya-kalendarnyie-prazdniki/'
const galleryTitle = 'Как украсить праздник шарами'

test('SSG: галерея открывается напрямую', async ({ page }) => {
  const response = await page.goto(galleryPath)

  expect(response?.status()).toBe(200)
  await expect(
    page.getByRole('heading', { level: 1, name: galleryTitle, exact: true }),
  ).toBeVisible()
})

test('SSG: ссылка «Смотреть всю галерею» открывает галерею через SPA', async ({
  page,
}, testInfo) => {
  const response = await page.goto('/dostavka-sharov.html')
  expect(response?.status()).toBe(200)

  const link = page.getByRole('link', {
    name: 'Смотреть всю галерею',
    exact: true,
  })
  await expect(link).toHaveAttribute('href', galleryPath)

  const documentRequests: string[] = []
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      documentRequests.push(request.url())
    }
  })

  // Запрос данных подтверждает, что ссылка обработана гидратированным роутером.
  const dataResponsePromise = page.waitForResponse((response) => {
    const pathname = new URL(response.url()).pathname
    return (
      pathname.startsWith(galleryPath.replace(/\/$/, '')) &&
      pathname.endsWith('.data') &&
      response.request().method() === 'GET'
    )
  })
  await link.click()
  const dataResponse = await dataResponsePromise
  await expect(page).toHaveURL(new RegExp(`${galleryPath}$`))

  await testInfo.attach('Ответ SSG при SPA-переходе', {
    body: JSON.stringify(
      {
        url: dataResponse.url(),
        status: dataResponse.status(),
        documentRequests,
      },
      null,
      2,
    ),
    contentType: 'application/json',
  })
  expect(documentRequests).toEqual([])
  expect.soft(dataResponse.status(), dataResponse.url()).toBe(200)
  await expect(
    page.getByRole('heading', { level: 1, name: galleryTitle, exact: true }),
  ).toBeVisible()
})
