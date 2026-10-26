import { test, expect } from '@playwright/test'

test('practice can be checked and restored in local history', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' })
  expect(response.status()).toBe(200)
  const start = page.getByRole('button', { name: 'Empezar práctica', exact: true })
  await expect(start).toBeEnabled()
  await start.click()
  await page.getByRole('radio').first().check()
  await page.getByRole('button', { name: 'Comprobar respuesta' }).click()
  await expect(page.locator('.feedback')).toBeVisible()
  await page.reload()
  await page.getByRole('button', { name: 'Mi progreso', exact: true }).click()
  await expect(page.locator('.history-list > li')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Tu progresión diaria' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Exportar todo' })).toBeEnabled()
  expect(errors).toEqual([])
})
