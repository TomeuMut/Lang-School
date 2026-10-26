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

test('ten-question grammar tests rotate and preserve their position across reload', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const grammar = page.getByRole('button', { name: /Gramática y vocabulario/ })
  await expect(grammar).toBeEnabled()
  await page.screenshot({ path: testInfo.outputPath('expanded-bank-home.png'), fullPage: true, animations: 'disabled' })
  await grammar.click()
  await expect(page.locator('.exercise-meta')).toContainText('Test 1/5')
  await expect(page.locator('.exercise-meta')).toContainText('1 de 10')
  await page.screenshot({ path: testInfo.outputPath('expanded-bank-practice.png'), fullPage: true, animations: 'disabled' })
  const firstPrompt = await page.locator('.question').textContent()
  for (let question = 1; question <= 10; question++) {
    await page.getByRole('radio').first().check()
    await page.getByRole('button', { name: 'Comprobar respuesta' }).click()
    if (question === 7) {
      await page.reload()
      await page.getByRole('button', { name: 'Continuar sesión', exact: true }).click()
      await expect(page.locator('.exercise-meta')).toContainText('7 de 10')
      await expect(page.locator('.feedback')).toBeVisible()
    }
    await page.getByRole('button', { name: question === 10 ? 'Ver resultado' : 'Siguiente ejercicio', exact: true }).click()
  }
  await expect(page.getByRole('heading', { name: 'Test completado.' })).toBeVisible()
  await page.getByRole('button', { name: 'Hacer otro test', exact: true }).click()
  await expect(page.locator('.exercise-meta')).toContainText('Test 2/5')
  await expect(page.locator('.exercise-meta')).toContainText('1 de 10')
  expect(await page.locator('.question').textContent()).not.toBe(firstPrompt)
})
