import { expect, test as base, type Page } from '@playwright/test'
import { defaultLearnerGoals, type LearnerGoals } from '@/lib/learner/learner-goals'
import { defaultDemoLearnerId } from '@/lib/auth/demo-store'

type E2EFixtures = {
  gotoAndAssertOk: (path: string) => Promise<void>
  loginAsDemoLearner: () => Promise<void>
  loginAsDemoAdmin: () => Promise<void>
}

const writingHistoryStorageKeys = [
  `lumina-writing-history:${defaultDemoLearnerId}`,
  'lumina-writing-history',
]

function formatError(source: string, message: string) {
  return `${source}: ${message}`
}

function isExpectedNavigationAbort(
  method: string,
  url: string,
  errorText: string | undefined
) {
  return (
    errorText === 'net::ERR_ABORTED' &&
    (url.includes('_rsc=') ||
      url.includes('/_next/') ||
      (method === 'POST' && !url.includes('/api/')))
  )
}

export const test = base.extend<E2EFixtures>({
  page: async ({ page }, runFixture) => {
    const runtimeErrors: string[] = []

    page.on('pageerror', (error) => {
      runtimeErrors.push(formatError('pageerror', error.message))
    })

    page.on('console', (message) => {
      if (message.type() === 'error') {
        runtimeErrors.push(formatError('console.error', message.text()))
      }
    })

    page.on('requestfailed', (request) => {
      const failureText = request.failure()?.errorText

      if (isExpectedNavigationAbort(request.method(), request.url(), failureText)) {
        return
      }

      runtimeErrors.push(
        formatError(
          'requestfailed',
          `${request.method()} ${request.url()} (${failureText ?? 'unknown error'})`
        )
      )
    })

    await runFixture(page)

    expect(
      runtimeErrors,
      `Unexpected browser runtime errors:\n${runtimeErrors.join('\n')}`
    ).toEqual([])
  },
  gotoAndAssertOk: async ({ page, baseURL }, runFixture) => {
    await runFixture(async (path: string) => {
      const response = await page.goto(path, {
        waitUntil: 'domcontentloaded',
      })

      expect(response, `No response returned for ${path}`).not.toBeNull()
      expect(
        response?.ok(),
        `Navigation failed for ${baseURL ?? ''}${path} with status ${response?.status()}`
      ).toBe(true)
    })
  },
  loginAsDemoLearner: async ({ page }, runFixture) => {
    await runFixture(async () => {
      await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })
      await page.getByRole('button', { name: 'Use demo learner' }).click()
      await page.getByRole('button', { name: 'Sign In' }).click()
      await expect(page).toHaveURL(/\/$/)
      await expect(
        page.getByRole('heading', { name: 'Welcome back, Demo Learner' })
      ).toBeVisible()
    })
  },
  loginAsDemoAdmin: async ({ page }, runFixture) => {
    await runFixture(async () => {
      await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })
      await page.getByRole('button', { name: 'Use demo admin' }).click()
      await page.getByRole('button', { name: 'Sign In' }).click()
      await expect(page).toHaveURL(/\/admin\/accounts$/)
    })
  },
})

export { expect }

export function createStoredHistoryEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: 'entry-1',
    promptId: 'task2-remote-work',
    promptTitle: 'Remote work and employee productivity',
    taskType: 'Task 2',
    createdAt: '2026-03-31T10:00:00.000Z',
    draftExcerpt: 'A focused IELTS draft excerpt',
    wordCount: 280,
    estimatedBand: 7,
    rubric: [
      {
        label: 'Task Response',
        score: 7,
        summary: 'Task response is moving in the right direction but still needs refinement.',
      },
      {
        label: 'Coherence and Cohesion',
        score: 7,
        summary:
          'Coherence and cohesion is moving in the right direction but still needs refinement.',
      },
      {
        label: 'Lexical Resource',
        score: 7,
        summary: 'Lexical resource is moving in the right direction but still needs refinement.',
      },
      {
        label: 'Grammatical Range and Accuracy',
        score: 7,
        summary: 'Grammar control is moving in the right direction but still needs refinement.',
      },
    ],
    strengths: ['The draft has a clear structure.'],
    priorities: ['Develop the second body paragraph with more precise support.'],
    ...overrides,
  }
}

export async function seedWritingHistory(page: Page, entries: unknown[]) {
  await page.addInitScript(
    ({ storageKeys, storedEntries }) => {
      for (const storageKey of storageKeys) {
        window.localStorage.setItem(storageKey, JSON.stringify(storedEntries))
      }
    },
    {
      storageKeys: writingHistoryStorageKeys,
      storedEntries: entries,
    }
  )

  await page.evaluate(
    ({ storageKeys, storedEntries }) => {
      for (const storageKey of storageKeys) {
        window.localStorage.setItem(storageKey, JSON.stringify(storedEntries))
      }
      window.dispatchEvent(new Event('lumina-writing-history-change'))
    },
    {
      storageKeys: writingHistoryStorageKeys,
      storedEntries: entries,
    }
  )
}

export async function seedLearnerGoals(
  page: Page,
  goals: LearnerGoals = defaultLearnerGoals
) {
  const response = await page.context().request.put(
    new URL('/api/learner-goals', page.url()).toString(),
    {
      data: goals,
    }
  )

  expect(response.ok()).toBe(true)
}
