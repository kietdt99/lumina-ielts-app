'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  defaultLearnerGoals,
  learnerGoalCurrentLevelOptions,
  learnerGoalFocusSkillOptions,
  learnerGoalStudyFrequencyOptions,
  learnerGoalTargetBandOptions,
  type LearnerGoals,
} from '@/lib/learner/learner-goals'

type LearnerGoalsSettingsProps = {
  initialGoals: LearnerGoals
  mode?: 'settings' | 'onboarding'
}

type LearnerGoalsResponse =
  | {
      ok: true
      goals: LearnerGoals
    }
  | {
      ok: false
      error: string
    }

export function LearnerGoalsSettings({
  initialGoals,
  mode = 'settings',
}: LearnerGoalsSettingsProps) {
  const router = useRouter()
  const [goals, setGoals] = useState(initialGoals)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const isOnboarding = mode === 'onboarding'

  function updateGoal<K extends keyof LearnerGoals>(key: K, value: LearnerGoals[K]) {
    setGoals((current) => ({
      ...current,
      [key]: value,
    }))
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  async function handleSave() {
    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(isOnboarding ? '/api/auth/onboarding' : '/api/learner-goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goals),
      })

      const payload = (await response.json()) as LearnerGoalsResponse

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok
            ? 'Unable to save learner goals right now.'
            : payload.error
        )
      }

      setGoals(payload.goals)
      setSuccessMessage(
        isOnboarding
          ? 'Onboarding completed. Your study plan is ready.'
          : 'Learner goals saved for this account.'
      )

      if (isOnboarding) {
        router.push('/')
      } else {
        router.refresh()
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : isOnboarding
            ? 'Unable to complete onboarding right now.'
            : 'Unable to save learner goals right now.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  function handleRestoreDefaults() {
    setGoals(defaultLearnerGoals)
    setErrorMessage(null)
    setSuccessMessage('Recommended learner goals restored locally. Save to apply them.')
  }

  return (
    <div className="settings-shell">
      <section className="glass writing-hero">
        <div className="writing-hero-copy">
          <p className="section-label">{isOnboarding ? 'Onboarding' : 'Settings'}</p>
          <h1>
            {isOnboarding
              ? 'Set the goals that will shape your first study plan'
              : 'Set the goals that shape your study plan'}
          </h1>
          <p>
            {isOnboarding
              ? 'Before you start practicing, tell Lumina what score you are chasing and which skill needs the most attention.'
              : 'These learner goals personalize the dashboard and keep Lumina aligned with the score you are aiming for next.'}
          </p>
        </div>
        <div className="writing-hero-metrics">
          <div className="metric-pill">
            <span className="metric-label">Target band</span>
            <strong>{goals.targetBand.toFixed(1)}</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Focus skill</span>
            <strong>{goals.focusSkill}</strong>
          </div>
          <div className="metric-pill">
            <span className="metric-label">Study rhythm</span>
            <strong>{goals.studyFrequency}</strong>
          </div>
        </div>
      </section>

      <div className="settings-layout">
        <section className="glass writing-panel">
          <div className="panel-heading">
            <h2>{isOnboarding ? 'Your first learner profile' : 'Learner goals'}</h2>
            <p>
              {isOnboarding
                ? 'Choose a realistic current level, the band you want next, and a study rhythm you can sustain.'
                : 'Update your current level, target band, and weekly rhythm whenever your prep plan changes.'}
            </p>
          </div>

          {errorMessage ? (
            <div className="feedback-error" role="alert">
              <strong>Unable to save learner goals</strong>
              <p>{errorMessage}</p>
            </div>
          ) : null}

          {successMessage ? (
            <div className="feedback-banner success-banner">{successMessage}</div>
          ) : null}

          <div className="settings-grid">
            <div className="field-group">
              <label htmlFor="target-band">Target band</label>
              <select
                id="target-band"
                className="text-input"
                value={goals.targetBand}
                onChange={(event) =>
                  updateGoal(
                    'targetBand',
                    Number(event.target.value) as LearnerGoals['targetBand']
                  )
                }
              >
                {learnerGoalTargetBandOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.toFixed(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="current-level">Current level</label>
              <select
                id="current-level"
                className="text-input"
                value={goals.currentLevel}
                onChange={(event) =>
                  updateGoal(
                    'currentLevel',
                    event.target.value as LearnerGoals['currentLevel']
                  )
                }
              >
                {learnerGoalCurrentLevelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="focus-skill">Focus skill</label>
              <select
                id="focus-skill"
                className="text-input"
                value={goals.focusSkill}
                onChange={(event) =>
                  updateGoal(
                    'focusSkill',
                    event.target.value as LearnerGoals['focusSkill']
                  )
                }
              >
                {learnerGoalFocusSkillOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="study-frequency">Study frequency</label>
              <select
                id="study-frequency"
                className="text-input"
                value={goals.studyFrequency}
                onChange={(event) =>
                  updateGoal(
                    'studyFrequency',
                    event.target.value as LearnerGoals['studyFrequency']
                  )
                }
              >
                {learnerGoalStudyFrequencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="settings-actions">
            <button
              type="button"
              className="primary-button"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving
                ? isOnboarding
                  ? 'Saving onboarding...'
                  : 'Saving goals...'
                : isOnboarding
                  ? 'Save and continue'
                  : 'Save learner goals'}
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled={isSaving}
              onClick={handleRestoreDefaults}
            >
              Restore recommended goals
            </button>
          </div>
        </section>

        <aside className="glass writing-panel">
          <div className="panel-heading">
            <h2>Current plan snapshot</h2>
            <p>
              {isOnboarding
                ? 'This snapshot becomes the baseline for your dashboard, tracker, and next-step recommendations.'
                : 'Keep this aligned with your latest IELTS timeline so the dashboard recommendations stay relevant.'}
            </p>
          </div>

          <div className="settings-summary">
            <div className="summary-box">
              <span className="metric-label">Target band</span>
              <strong>{goals.targetBand.toFixed(1)}</strong>
            </div>
            <div className="summary-box">
              <span className="metric-label">Current level</span>
              <strong>{goals.currentLevel}</strong>
            </div>
            <div className="summary-box">
              <span className="metric-label">Focus skill</span>
              <strong>{goals.focusSkill}</strong>
            </div>
            <div className="summary-box">
              <span className="metric-label">Study frequency</span>
              <strong>{goals.studyFrequency}</strong>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
