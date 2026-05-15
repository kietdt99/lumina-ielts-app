import { expect, test } from './fixtures'

test.describe('vocabulary builder flow', () => {
  test('lets learners filter recall cards and track lexical confidence', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/vocabulary-builder')

    await expect(
      page.getByRole('heading', {
        name: 'Turn useful vocabulary into active IELTS recall',
      })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'renewable energy' })
    ).toBeVisible()

    await page.getByLabel('Search vocabulary').fill('renewable')
    await expect(
      page.getByRole('heading', { name: 'renewable energy' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'workplace autonomy' })
    ).toHaveCount(0)

    await page.getByRole('button', { name: 'I know this' }).click()
    await expect(page.getByText('1 known cards')).toBeVisible()

    await page.getByLabel('Search vocabulary').fill('')
    await page.getByRole('button', { name: 'Task 1' }).click()
    await page.getByLabel('Card type').selectOption('Collocation')
    await page.getByLabel('Topic focus').selectOption('Environment and climate')
    await page.getByLabel('Search vocabulary').fill('impact')

    await expect(
      page.getByRole('heading', { name: 'reduce environmental impact' })
    ).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'renewable energy' })
    ).toHaveCount(0)

    const response = await page.request.get(
      '/api/vocabulary-builder?taskType=Task%201&cardType=Collocation&topic=Environment%20and%20climate&query=impact'
    )
    const payload = (await response.json()) as {
      ok: boolean
      cards: Array<{ id: string }>
    }

    expect(response.ok()).toBe(true)
    expect(payload.ok).toBe(true)
    expect(payload.cards.map((card) => card.id)).toEqual([
      'environment-climate-collocation-reduce-environmental-impact',
    ])

    await page.getByRole('link', { name: 'Open writing workspace' }).click()
    await expect(page).toHaveURL(/\/writing$/)
    await expect(
      page.getByRole('heading', { name: 'Train like a real IELTS session' })
    ).toBeVisible()
  })
})
