import { requireLearnerAppSession } from '@/lib/auth/service'
import { createMockTestDebrief } from '@/lib/ielts/mock-test-debrief'
import { writingMockTests } from '@/lib/ielts/mock-test-lab'

const invalidPayloadError = 'Invalid mock test debrief payload.'

type MockTestDebriefPayload = {
  testId?: unknown
  taskOneDraft?: unknown
  taskTwoDraft?: unknown
  remainingSeconds?: unknown
  completedCheckpointIds?: unknown
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function jsonError(error: string, status: number) {
  return Response.json(
    {
      ok: false,
      error,
    },
    { status }
  )
}

export async function POST(request: Request) {
  await requireLearnerAppSession()

  let payload: MockTestDebriefPayload

  try {
    payload = (await request.json()) as MockTestDebriefPayload
  } catch {
    return jsonError('Request body must be valid JSON.', 400)
  }

  if (!payload || typeof payload !== 'object') {
    return jsonError(invalidPayloadError, 400)
  }

  const {
    completedCheckpointIds = [],
    remainingSeconds,
    taskOneDraft = '',
    taskTwoDraft = '',
    testId,
  } = payload

  if (
    typeof testId !== 'string' ||
    typeof taskOneDraft !== 'string' ||
    typeof taskTwoDraft !== 'string' ||
    !isStringArray(completedCheckpointIds) ||
    (remainingSeconds !== undefined &&
      (typeof remainingSeconds !== 'number' || !Number.isFinite(remainingSeconds)))
  ) {
    return jsonError(invalidPayloadError, 400)
  }

  const test = writingMockTests.find((mockTest) => mockTest.id === testId)

  if (!test) {
    return jsonError('Mock test not found.', 404)
  }

  return Response.json({
    ok: true,
    debrief: createMockTestDebrief({
      test,
      taskOneDraft,
      taskTwoDraft,
      remainingSeconds,
      completedCheckpointIds,
    }),
  })
}
