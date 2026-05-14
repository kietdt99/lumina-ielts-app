import { expect, test } from './fixtures'

const strongDraft = [
  'Remote work can improve productivity because employees protect focused time and avoid tiring commutes.',
  '',
  'For example, a software developer may complete complex tasks faster at home because fewer interruptions break concentration. Moreover, flexible schedules can help people work during their most productive hours.',
  '',
  'However, office work remains useful because new employees often need direct mentoring and quick informal feedback. Therefore, companies should create communication routines instead of assuming remote work succeeds automatically.',
  '',
  'In conclusion, remote work is productive when autonomy is balanced with accountability and clear team communication.',
].join('\n')

test.describe('readiness lab flow', () => {
  test('checks draft readiness and hands off into writing', async ({
    page,
    gotoAndAssertOk,
    loginAsDemoLearner,
  }) => {
    await loginAsDemoLearner()

    await gotoAndAssertOk('/readiness-lab')

    await expect(
      page.getByRole('heading', { name: 'Check a draft before asking for feedback' })
    ).toBeVisible()

    await page.getByLabel('Draft to check').fill(strongDraft)
    await page.getByRole('button', { name: 'Run readiness check' }).click()

    await expect(page.getByLabel('Readiness result')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Ready for practice feedback' })
    ).toBeVisible()
    await expect(page.locator('.readiness-score-card').last()).toContainText('%')

    const response = await page.request.post('/api/writing/readiness', {
      data: {
        promptId: 'task2-remote-work',
        draft: strongDraft,
      },
    })
    const payload = (await response.json()) as {
      ok: boolean
      readiness?: { promptId: string; readinessScore: number }
    }

    expect(response.ok()).toBe(true)
    expect(payload.ok).toBe(true)
    expect(payload.readiness?.promptId).toBe('task2-remote-work')
    expect(payload.readiness?.readinessScore).toBeGreaterThanOrEqual(80)

    await page.getByRole('link', { name: 'Open with outline' }).click()
    await expect(page).toHaveURL(/\/writing\?promptId=task2-remote-work&outline=1$/)
    await expect(
      page.getByRole('heading', { name: 'Remote work and employee productivity' })
    ).toBeVisible()
    await expect(page.getByLabel('Loaded writing outline')).toBeVisible()
  })
})
