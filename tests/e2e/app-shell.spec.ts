import { test, expect } from './fixtures'

test.describe('app shell', () => {
  test('changes to a pastel theme after each login', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Use demo learner' }).click()
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/$/)

    const firstTheme = await page.locator('html').getAttribute('data-theme')
    expect(firstTheme).toBeTruthy()

    await page.getByRole('button', { name: 'Sign Out' }).first().click()
    await expect(page).toHaveURL(/\/auth\/login$/)

    await page.getByRole('button', { name: 'Use demo admin' }).click()
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/admin\/accounts$/)

    const secondTheme = await page.locator('html').getAttribute('data-theme')
    expect(secondTheme).toBeTruthy()
    expect(secondTheme).not.toBe(firstTheme)
  })

  test('loads the main routes without browser runtime errors', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/')
    await expect(
      page.getByRole('heading', { name: 'Welcome back, Demo Learner' })
    ).toBeVisible()

    await gotoAndAssertOk('/writing')
    await expect(
      page.getByRole('heading', { name: 'Train like a real IELTS session' })
    ).toBeVisible()

    await gotoAndAssertOk('/rubric-guide')
    await expect(
      page.getByRole('heading', { name: 'Understand what moves a writing band' })
    ).toBeVisible()

    await gotoAndAssertOk('/idea-bank')
    await expect(
      page.getByRole('heading', { name: 'Build answers faster with topic-ready ideas' })
    ).toBeVisible()

    await gotoAndAssertOk('/model-fragments')
    await expect(
      page.getByRole('heading', { name: 'Study short fragments, not full essays' })
    ).toBeVisible()

    await gotoAndAssertOk('/outline-builder')
    await expect(
      page.getByRole('heading', { name: 'Plan the answer before the timer starts' })
    ).toBeVisible()

    await gotoAndAssertOk('/tracker')
    await expect(
      page.getByRole('heading', { name: 'See how your writing practice is evolving' })
    ).toBeVisible()

    await gotoAndAssertOk('/study-plan')
    await expect(
      page.getByRole('heading', { name: /sessions left this week|Weekly rhythm is on track/ })
    ).toBeVisible()

    await gotoAndAssertOk('/review-queue')
    await expect(
      page.getByRole('heading', { name: /Start your first review loop|\d+ review actions ready/ })
    ).toBeVisible()

    await gotoAndAssertOk('/revision-checklist')
    await expect(
      page.getByRole('heading', {
        name: 'Turn feedback into a focused rewrite checklist',
      })
    ).toBeVisible()

    await gotoAndAssertOk('/mistake-library')
    await expect(
      page.getByRole('heading', {
        name: 'Learn the mistakes before they steal band points',
      })
    ).toBeVisible()

    await gotoAndAssertOk('/mistake-journal')
    await expect(
      page.getByRole('heading', { name: /Build your mistake journal|\d+ mistake patterns found/ })
    ).toBeVisible()

    await gotoAndAssertOk('/settings')
    await expect(
      page.getByRole('heading', { name: 'Set the goals that shape your study plan' })
    ).toBeVisible()

    await gotoAndAssertOk('/auth/login')
    await expect(page).toHaveURL(/\/$/)
  })

  test('navigates through the sidebar without browser runtime errors', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/')

    await page.getByRole('link', { name: 'Writing Assistant' }).click()
    await expect(page).toHaveURL(/\/writing$/)
    await expect(
      page.getByRole('heading', { name: 'Train like a real IELTS session' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Rubric Guide', exact: true }).click()
    await expect(page).toHaveURL(/\/rubric-guide$/)
    await expect(
      page.getByRole('heading', { name: 'Understand what moves a writing band' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Idea Bank' }).click()
    await expect(page).toHaveURL(/\/idea-bank$/)
    await expect(
      page.getByRole('heading', { name: 'Build answers faster with topic-ready ideas' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Model Fragments', exact: true }).click()
    await expect(page).toHaveURL(/\/model-fragments$/)
    await expect(
      page.getByRole('heading', { name: 'Study short fragments, not full essays' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Outline Builder' }).click()
    await expect(page).toHaveURL(/\/outline-builder$/)
    await expect(
      page.getByRole('heading', { name: 'Plan the answer before the timer starts' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Score Tracker' }).click()
    await expect(page).toHaveURL(/\/tracker$/)
    await expect(
      page.getByRole('heading', { name: 'See how your writing practice is evolving' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Study Plan' }).click()
    await expect(page).toHaveURL(/\/study-plan$/)
    await expect(
      page.getByRole('heading', { name: /sessions left this week|Weekly rhythm is on track/ })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Review Queue' }).click()
    await expect(page).toHaveURL(/\/review-queue$/)
    await expect(
      page.getByRole('heading', { name: /Start your first review loop|\d+ review actions ready/ })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Revision Checklist', exact: true }).click()
    await expect(page).toHaveURL(/\/revision-checklist$/)
    await expect(
      page.getByRole('heading', {
        name: 'Turn feedback into a focused rewrite checklist',
      })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Mistake Library', exact: true }).click()
    await expect(page).toHaveURL(/\/mistake-library$/)
    await expect(
      page.getByRole('heading', {
        name: 'Learn the mistakes before they steal band points',
      })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Mistake Journal', exact: true }).click()
    await expect(page).toHaveURL(/\/mistake-journal$/)
    await expect(
      page.getByRole('heading', { name: /Build your mistake journal|\d+ mistake patterns found/ })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Profile Settings' }).click()
    await expect(page).toHaveURL(/\/settings\/profile$/)
    await expect(
      page.getByRole('heading', { name: 'Set the goals that shape your study plan' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(
      page.getByRole('heading', { name: 'Welcome back, Demo Learner' })
    ).toBeVisible()
  })
})
