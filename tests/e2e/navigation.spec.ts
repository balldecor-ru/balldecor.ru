import { test, expect } from '@playwright/test'

test('unknown pages and missing assets return 404', async ({
  page,
  request,
}) => {
  const response = await page.goto('/missing-e2e-page')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /noindex/,
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  const asset = await request.get('/assets/missing-e2e.js')
  expect(asset.status()).toBe(404)
})
