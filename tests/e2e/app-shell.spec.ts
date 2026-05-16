import { test, expect } from './fixtures'

const loginDialogName = /Log in to Lumina IELTS|Đăng nhập Lumina IELTS/
const loginButtonName = /Log In|Đăng nhập/
const demoAdminButtonName = /Use demo admin|Dùng demo admin/
const demoLearnerButtonName = /Use demo learner|Dùng demo learner/

test.describe('app shell', () => {
  test('opens the login dialog on the welcome page without navigation', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/$/)
    await page.getByRole('button', { name: loginButtonName }).click()

    const loginDialog = page.getByRole('dialog', {
      name: loginDialogName,
    })

    await expect(page).toHaveURL(/\/$/)
    await expect(loginDialog).toBeVisible()
    await expect(
      loginDialog.getByPlaceholder('Enter your email')
    ).toBeVisible()
    await expect(
      loginDialog.getByText(
        'Lumina uses admin-managed learner accounts.'
      )
    ).toHaveCount(0)
    await expect(
      loginDialog.getByText('Credential check')
    ).toHaveCount(0)
  })

  test('keeps the peach theme stable after login', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(
      page.getByRole('heading', {
        name: 'Luyện IELTS nhẹ nhàng, có lộ trình và thấy rõ tiến bộ.',
      })
    ).toBeVisible()
    await page.getByRole('button', { name: loginButtonName }).click()
    let loginDialog = page.getByRole('dialog', {
      name: loginDialogName,
    })
    await loginDialog.getByRole('button', { name: demoLearnerButtonName }).click()
    await loginDialog.getByRole('button', { name: loginButtonName }).click()
    await expect(page).toHaveURL(/\/dashboard$/)

    const firstTheme = await page.locator('html').getAttribute('data-theme')
    expect(firstTheme).toBe('peach')

    await page.getByRole('button', { name: 'Sign Out' }).first().click()
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole('button', { name: loginButtonName }).click()
    loginDialog = page.getByRole('dialog', {
      name: loginDialogName,
    })
    await loginDialog.getByRole('button', { name: demoAdminButtonName }).click()
    await loginDialog.getByRole('button', { name: loginButtonName }).click()
    await expect(page).toHaveURL(/\/admin\/accounts$/)

    const secondTheme = await page.locator('html').getAttribute('data-theme')
    expect(secondTheme).toBe('peach')
  })

  test('loads the main routes without browser runtime errors', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/dashboard')
    await expect(
      page.getByRole('heading', { name: 'Welcome back, Demo Learner' })
    ).toBeVisible()

    await gotoAndAssertOk('/writing')
    await expect(
      page.getByRole('heading', { name: 'Train like a real IELTS session' })
    ).toBeVisible()

    await gotoAndAssertOk('/readiness-lab')
    await expect(
      page.getByRole('heading', { name: 'Check a draft before asking for feedback' })
    ).toBeVisible()

    await gotoAndAssertOk('/practice-sprint')
    await expect(
      page.getByRole('heading', { name: 'Start a focused IELTS writing sprint' })
    ).toBeVisible()

    await gotoAndAssertOk('/mock-test')
    await expect(
      page.getByRole('heading', { name: 'Complete a full IELTS Writing mock test' })
    ).toBeVisible()

    await gotoAndAssertOk('/reading-practice')
    await expect(
      page.getByRole('heading', {
        name: 'Train IELTS Reading with instant explanations',
      })
    ).toBeVisible()

    await gotoAndAssertOk('/listening-practice')
    await expect(
      page.getByRole('heading', {
        name: 'Train IELTS Listening with replayable simulations',
      })
    ).toBeVisible()

    await gotoAndAssertOk('/speaking-practice')
    await expect(
      page.getByRole('heading', {
        name: 'Train IELTS Speaking with cue-card drills',
      })
    ).toBeVisible()

    await gotoAndAssertOk('/prompt-explorer')
    await expect(
      page.getByRole('heading', {
        name: 'Choose the right IELTS prompt before the timer starts',
      })
    ).toBeVisible()

    await gotoAndAssertOk('/rubric-guide')
    await expect(
      page.getByRole('heading', { name: 'Understand what moves a writing band' })
    ).toBeVisible()

    await gotoAndAssertOk('/idea-bank')
    await expect(
      page.getByRole('heading', { name: 'Build answers faster with topic-ready ideas' })
    ).toBeVisible()

    await gotoAndAssertOk('/vocabulary-builder')
    await expect(
      page.getByRole('heading', {
        name: 'Turn useful vocabulary into active IELTS recall',
      })
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

    await gotoAndAssertOk('/progress-insights')
    await expect(
      page.getByRole('heading', { name: /Build your first progress signal|Close a \d+\.\d band gap with focused practice|Your writing band is close to target/ })
    ).toBeVisible()

    await gotoAndAssertOk('/study-plan')
    await expect(
      page.getByRole('heading', { name: /sessions left this week|Weekly rhythm is on track/ })
    ).toBeVisible()

    await gotoAndAssertOk('/review-queue')
    await expect(
      page.getByRole('heading', { name: /Start your first review loop|\d+ review actions ready/ })
    ).toBeVisible()

    await gotoAndAssertOk('/revision-studio')
    await expect(
      page.getByRole('heading', { name: /Start your first revision studio|\d+ saved drafts? (is|are) ready for rewrite/ })
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
    await expect(page).toHaveURL(/\/dashboard$/)
  })

  test('navigates through the sidebar without browser runtime errors', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/dashboard')

    await page.getByRole('link', { name: 'Writing Assistant' }).click()
    await expect(page).toHaveURL(/\/writing$/)
    await expect(
      page.getByRole('heading', { name: 'Train like a real IELTS session' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Reading Practice', exact: true }).click()
    await expect(page).toHaveURL(/\/reading-practice$/)
    await expect(
      page.getByRole('heading', {
        name: 'Train IELTS Reading with instant explanations',
      })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Listening Practice', exact: true }).click()
    await expect(page).toHaveURL(/\/listening-practice$/)
    await expect(
      page.getByRole('heading', {
        name: 'Train IELTS Listening with replayable simulations',
      })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Speaking Practice', exact: true }).click()
    await expect(page).toHaveURL(/\/speaking-practice$/)
    await expect(
      page.getByRole('heading', {
        name: 'Train IELTS Speaking with cue-card drills',
      })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Mock Test Lab', exact: true }).click()
    await expect(page).toHaveURL(/\/mock-test$/)
    await expect(
      page.getByRole('heading', { name: 'Complete a full IELTS Writing mock test' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Study Plan', exact: true }).click()
    await expect(page).toHaveURL(/\/study-plan$/)
    await expect(
      page.getByRole('heading', { name: /sessions left this week|Weekly rhythm is on track/ })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Score Tracker' }).click()
    await expect(page).toHaveURL(/\/tracker$/)
    await expect(
      page.getByRole('heading', { name: 'See how your writing practice is evolving' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Profile Settings' }).click()
    await expect(page).toHaveURL(/\/settings\/profile$/)
    await expect(
      page.getByRole('heading', { name: 'Set the goals that shape your study plan' })
    ).toBeVisible()

    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(
      page.getByRole('heading', { name: 'Welcome back, Demo Learner' })
    ).toBeVisible()
  })
})
