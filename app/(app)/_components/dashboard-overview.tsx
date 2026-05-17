'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'
import { signout } from '@/app/auth/actions'
import { PracticeAttemptHistoryPanel } from '@/app/(app)/_components/practice-attempt-history-panel'
import { UserAvatar } from '@/app/_components/ui/user-avatar'
import {
  ChecklistIcon,
  CompassIcon,
  SparklesIcon,
  TargetIcon,
  TrophyIcon,
} from '@/app/_components/ui/app-icons'
import type { AppLanguage } from '@/lib/i18n/app-language'
import type { LearnerGoals } from '@/lib/learner/learner-goals'
import {
  hydrateWritingHistory,
  getServerWritingHistorySnapshot,
  getWritingHistorySnapshot,
  subscribeToWritingHistory,
  type WritingHistoryEntry,
} from '@/lib/ielts/writing-history'
import {
  averageBand,
  bestBand,
  countTaskType,
  latestEntry,
  recentEntries,
} from '@/lib/ielts/writing-history-insights'
import {
  getPracticeAttemptHistorySnapshot,
  getServerPracticeAttemptHistorySnapshot,
  subscribeToPracticeAttemptHistory,
} from '@/lib/ielts/practice-attempt-history'
import { createSkillPracticePlan } from '@/lib/ielts/skill-practice-plan'
import { createStudyRecommendation } from '@/lib/ielts/study-plan'

type DashboardCopy = {
  sectionLabel: string
  heading: (learnerName: string) => string
  intro: string
  startSprint: string
  updateGoals: string
  signOut: string
  missionCardLabel: string
  missionKicker: string
  missionTitle: (moduleTitle: string) => string
  missionBody: (entryCount: number, moduleTitle: string) => string
  latestCheckpoint: string
  noCheckpoint: string
  focusSkill: string
  nextModule: string
  learningPath: string
  momentum: string
  bestSnapshot: string
  targetBand: string
  averageBand: string
  bestResult: string
  goalsSnapshot: (goals: LearnerGoals) => string
  averageDescription: string
  bestDescription: (entryCount: number) => string
  practiceRoute: string
  practiceMixTitle: string
  practiceSummary: (moduleTitle: string) => string
  openFocusWorkspace: string
  currentFocus: string
  openPracticeModule: (moduleTitle: string) => string
  weeklyMixLabel: string
  minutes: (minutes: number) => string
  sessionCount: (sessionCount: number) => string
  recentSkillAttemptsTitle: string
  recentSkillAttemptsDescription: string
  recentActivity: string
  recentActivityDescription: string
  openTracker: string
  activityWords: (wordCount: number) => string
  nextFocus: string
  openDetail: string
  firstCheckpoint: string
  noActivity: string
  noActivityDescription: string
  suggestedStart: string
  suggestedStartDescription: string
  nextBestStep: string
  nextBestStepDescription: string
  openFocusModuleLink: string
  recommendation: string
  recentAverage: string
  targetGap: string
  sessionsThisWeek: string
  now: string
  gap: string
  rhythm: string
  latestPrompt: string
  taskBalance: string
  studyRhythm: string
  recurringFocus: string
  currentPriority: string
  priorityRightNow: string
  buildMomentum: string
  buildMomentumDescription: (goals: LearnerGoals) => string
  firstRecommendation: string
  firstRecommendationDescription: (moduleTitle: string) => string
  firstReview: string
  dashboardInsight: string
  openSkillFocusModule: (skill: string) => string
  refineGoals: string
}

const dashboardCopy: Record<AppLanguage, DashboardCopy> = {
  vi: {
    sectionLabel: 'Nhiệm vụ hôm nay',
    heading: (learnerName) => `Chọn một sprint nhỏ, ${learnerName}`,
    intro:
      'Một màn hình gọn để biết nên học gì ngay bây giờ, xem tiến độ chính, rồi quay lại luyện tập.',
    startSprint: 'Bắt đầu sprint trọng tâm',
    updateGoals: 'Chỉnh mục tiêu',
    signOut: 'Đăng xuất',
    missionCardLabel: 'Thẻ nhiệm vụ học hôm nay',
    missionKicker: 'Hôm nay',
    missionTitle: (moduleTitle) => `Ưu tiên: ${moduleTitle}`,
    missionBody: (entryCount, moduleTitle) =>
      entryCount
        ? `${entryCount} checkpoint đã lưu. Tiếp tục với ${moduleTitle} để giữ nhịp bốn kỹ năng.`
        : `Bắt đầu với ${moduleTitle}, sau đó lưu một checkpoint Writing để Lumina cá nhân hóa vòng học tiếp theo.`,
    latestCheckpoint: 'Checkpoint mới nhất',
    noCheckpoint: 'Chưa có',
    focusSkill: 'Kỹ năng trọng tâm',
    nextModule: 'Module tiếp theo',
    learningPath: 'Lộ trình',
    momentum: 'Đà học',
    bestSnapshot: 'Mốc tốt nhất',
    targetBand: 'Band mục tiêu',
    averageBand: 'Band trung bình',
    bestResult: 'Kết quả tốt nhất',
    goalsSnapshot: (goals) =>
      `${goals.currentLevel} · Ưu tiên ${goals.focusSkill} · ${goals.studyFrequency}`,
    averageDescription:
      'Tính từ các bài Writing đã lưu trong tài khoản learner này.',
    bestDescription: (entryCount) =>
      entryCount
        ? `${entryCount} phiên Writing đã được theo dõi.`
        : 'Hoàn thành một phiên Writing để bắt đầu đo tiến bộ.',
    practiceRoute: 'Vòng luyện tập',
    practiceMixTitle: 'Lộ trình bốn kỹ năng',
    practiceSummary: (moduleTitle) =>
      `Tuần này bắt đầu với ${moduleTitle}, rồi quay lại Writing để có dữ liệu tiến bộ rõ hơn.`,
    openFocusWorkspace: 'Mở module trọng tâm',
    currentFocus: 'Đang ưu tiên',
    openPracticeModule: (moduleTitle) => `Mở ${moduleTitle}`,
    weeklyMixLabel: 'Lịch luyện tập trong tuần',
    minutes: (minutes) => `${minutes} phút`,
    sessionCount: (sessionCount) =>
      `${sessionCount} phiên`,
    recentSkillAttemptsTitle: 'Lần luyện kỹ năng gần đây',
    recentSkillAttemptsDescription:
      'Các lần chấm Reading, Listening, Speaking sẽ xuất hiện tại đây sau khi learner hoàn tất một lượt luyện.',
    recentActivity: 'Hoạt động gần đây',
    recentActivityDescription:
      'Các checkpoint Writing mới nhất sẽ tự động xuất hiện tại đây.',
    openTracker: 'Mở bảng điểm',
    activityWords: (wordCount) => `${wordCount} từ`,
    nextFocus: 'Trọng tâm tiếp theo',
    openDetail: 'Mở chi tiết',
    firstCheckpoint: 'Checkpoint đầu tiên',
    noActivity: 'Chưa có hoạt động.',
    noActivityDescription:
      'Khi hoàn tất một bài Writing được review, Lumina sẽ hiển thị band estimate và trọng tâm rewrite ở đây.',
    suggestedStart: 'Gợi ý bắt đầu',
    suggestedStartDescription:
      'Mở module trọng tâm trước, sau đó giữ một bài Writing trong vòng feedback để dashboard có dữ liệu thật.',
    nextBestStep: 'Bước học kế tiếp',
    nextBestStepDescription:
      'Dựa vào mục tiêu, kỹ năng trọng tâm và dữ liệu Writing gần đây để chọn block học tiếp theo.',
    openFocusModuleLink: 'Mở module trọng tâm',
    recommendation: 'Gợi ý',
    recentAverage: 'Trung bình gần đây',
    targetGap: 'Khoảng cách tới mục tiêu',
    sessionsThisWeek: 'Phiên tuần này',
    now: 'Hiện tại',
    gap: 'Khoảng cách',
    rhythm: 'Nhịp học',
    latestPrompt: 'Prompt mới nhất',
    taskBalance: 'Cân bằng Task',
    studyRhythm: 'Nhịp học',
    recurringFocus: 'Lỗi lặp lại',
    currentPriority: 'Trọng tâm hiện tại',
    priorityRightNow: 'Ưu tiên ngay lúc này',
    buildMomentum: 'Tạo đà học tập',
    buildMomentumDescription: (goals) =>
      `Hướng tới Band ${goals.targetBand.toFixed(1)} với nhịp ${goals.studyFrequency.toLowerCase()}. Hoàn tất một vòng feedback Writing để Lumina đề xuất bước tiếp theo.`,
    firstRecommendation: 'Gợi ý đầu tiên',
    firstRecommendationDescription: (moduleTitle) =>
      `Bắt đầu với ${moduleTitle}, sau đó review một bài Writing để biến dữ liệu thành kế hoạch học cụ thể.`,
    firstReview: 'Review đầu tiên',
    dashboardInsight: 'Insight dashboard',
    openSkillFocusModule: (skill) => `Mở module ${skill}`,
    refineGoals: 'Chỉnh lại mục tiêu',
  },
  en: {
    sectionLabel: 'Today Mission',
    heading: (learnerName) => `Choose one smart sprint, ${learnerName}`,
    intro:
      'A lighter dashboard for deciding what to study now, checking the signals that matter, and returning to practice fast.',
    startSprint: 'Start focus sprint',
    updateGoals: 'Update goals',
    signOut: 'Sign Out',
    missionCardLabel: 'Today study mission card',
    missionKicker: 'Today',
    missionTitle: (moduleTitle) => `Priority: ${moduleTitle}`,
    missionBody: (entryCount, moduleTitle) =>
      entryCount
        ? `${entryCount} checkpoint${entryCount === 1 ? '' : 's'} saved. Continue with ${moduleTitle} to keep the four-skill loop moving.`
        : `Start with ${moduleTitle}, then save one Writing checkpoint so Lumina can personalize the next loop.`,
    latestCheckpoint: 'Latest checkpoint',
    noCheckpoint: 'Not yet',
    focusSkill: 'Focus skill',
    nextModule: 'Next module',
    learningPath: 'Learning path',
    momentum: 'Momentum',
    bestSnapshot: 'Best snapshot',
    targetBand: 'Target Band',
    averageBand: 'Average Band',
    bestResult: 'Best Result',
    goalsSnapshot: (goals) =>
      `${goals.currentLevel} · ${goals.focusSkill} focus · ${goals.studyFrequency}`,
    averageDescription:
      'Calculated from the writing practice sessions saved for this learner account.',
    bestDescription: (entryCount) =>
      entryCount
        ? `${entryCount} tracked writing session${entryCount === 1 ? '' : 's'} completed.`
        : 'Start a writing session to begin tracking your progress.',
    practiceRoute: 'Practice route',
    practiceMixTitle: 'Four-Skill Practice Mix',
    practiceSummary: (moduleTitle) =>
      `This week starts with ${moduleTitle}, then returns to Writing so progress stays measurable.`,
    openFocusWorkspace: 'Open focus workspace',
    currentFocus: 'Current focus',
    openPracticeModule: (moduleTitle) => `Open ${moduleTitle}`,
    weeklyMixLabel: 'Weekly practice mix',
    minutes: (minutes) => `${minutes} min`,
    sessionCount: (sessionCount) =>
      `${sessionCount} session${sessionCount === 1 ? '' : 's'}`,
    recentSkillAttemptsTitle: 'Recent Skill Attempts',
    recentSkillAttemptsDescription:
      'Recent Reading, Listening, and Speaking scoring runs appear here after a learner completes a practice check.',
    recentActivity: 'Recent Activity',
    recentActivityDescription:
      'Your latest writing checkpoints appear here automatically.',
    openTracker: 'Open tracker',
    activityWords: (wordCount) => `${wordCount} words`,
    nextFocus: 'Next focus',
    openDetail: 'Open detail',
    firstCheckpoint: 'First checkpoint',
    noActivity: 'No activity saved yet.',
    noActivityDescription:
      'The moment you finish a reviewed draft, Lumina will surface your latest band estimate and revision focus here.',
    suggestedStart: 'Suggested start',
    suggestedStartDescription:
      'Open the focus module first, then keep one Writing draft in the loop so your dashboard has measurable feedback.',
    nextBestStep: 'Next Best Step',
    nextBestStepDescription:
      'Use learner goals, focus skill, and recent writing data to choose the next study block.',
    openFocusModuleLink: 'Open focus module',
    recommendation: 'Recommendation',
    recentAverage: 'Recent average',
    targetGap: 'Target gap',
    sessionsThisWeek: 'Sessions this week',
    now: 'Now',
    gap: 'Gap',
    rhythm: 'Rhythm',
    latestPrompt: 'Latest prompt',
    taskBalance: 'Task balance',
    studyRhythm: 'Study rhythm',
    recurringFocus: 'Recurring focus',
    currentPriority: 'Current focus',
    priorityRightNow: 'Priority right now',
    buildMomentum: 'Build momentum',
    buildMomentumDescription: (goals) =>
      `Aim for Band ${goals.targetBand.toFixed(1)} with a ${goals.studyFrequency.toLowerCase()} rhythm. Complete one writing feedback cycle and Lumina will suggest your next revision focus here.`,
    firstRecommendation: 'First recommendation',
    firstRecommendationDescription: (moduleTitle) =>
      `Start with ${moduleTitle}, then review one Writing draft so this panel can turn evidence into a concrete next-step plan.`,
    firstReview: 'First review',
    dashboardInsight: 'Dashboard insight',
    openSkillFocusModule: (skill) => `Open ${skill} focus module`,
    refineGoals: 'Refine learner goals',
  },
}

const vietnameseSkillModules: Record<
  string,
  {
    title: string
    description: string
    actionLabel: string
  }
> = {
  Writing: {
    title: 'Luyện Writing',
    description: 'Viết, nhận feedback, rồi rewrite theo rubric.',
    actionLabel: 'Bắt đầu Writing',
  },
  Reading: {
    title: 'Luyện Reading',
    description: 'Quét ý chính, match evidence và kiểm tra đáp án nhanh.',
    actionLabel: 'Bắt đầu Reading',
  },
  Listening: {
    title: 'Luyện Listening',
    description: 'Luyện bắt chi tiết, ghi chú và review từng section.',
    actionLabel: 'Bắt đầu Listening',
  },
  Speaking: {
    title: 'Luyện Speaking',
    description: 'Chuẩn bị cue-card, luyện follow-up và giữ flow trả lời.',
    actionLabel: 'Bắt đầu Speaking',
  },
}

const vietnameseSkillEvidence: Record<string, string> = {
  Writing: 'band estimate và ưu tiên rewrite',
  Reading: 'kiểm tra cách xử lý câu hỏi',
  Listening: 'review bằng transcript',
  Speaking: 'cấu trúc trả lời và độ trôi chảy',
}

function formatDate(value: string, language: AppLanguage) {
  return new Date(value).toLocaleString(language === 'vi' ? 'vi-VN' : undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function getSkillModuleDisplay(
  language: AppLanguage,
  module: {
    skill: string
    title: string
    description: string
    actionLabel: string
  }
) {
  if (language === 'en') {
    return {
      skill: module.skill,
      title: module.title,
      description: module.description,
      actionLabel: module.actionLabel,
    }
  }

  return {
    skill: module.skill,
    title: vietnameseSkillModules[module.skill]?.title ?? module.title,
    description:
      vietnameseSkillModules[module.skill]?.description ?? module.description,
    actionLabel:
      vietnameseSkillModules[module.skill]?.actionLabel ?? module.actionLabel,
  }
}

function getSkillEvidence(
  language: AppLanguage,
  skill: string,
  fallbackEvidence: string
) {
  if (language === 'en') {
    return fallbackEvidence
  }

  return vietnameseSkillEvidence[skill] ?? fallbackEvidence
}

function getRecommendationDisplay(
  language: AppLanguage,
  recommendation: ReturnType<typeof createStudyRecommendation>,
  goals: LearnerGoals,
  entries: WritingHistoryEntry[]
) {
  if (language === 'en') {
    return {
      headline: recommendation.headline,
      summary: recommendation.summary,
      actions: recommendation.actions,
    }
  }

  if (!entries.length) {
    return {
      headline: `Bắt đầu vòng học ${goals.focusSkill}`,
      summary: `Bạn đang từ ${goals.currentLevel} hướng tới Band ${goals.targetBand.toFixed(1)}. Hoàn tất một phiên ${goals.focusSkill} và review feedback ngay sau đó.`,
      actions: [
        `Hoàn tất phiên luyện ${goals.focusSkill} đầu tiên.`,
        `Giữ nhịp ${goals.studyFrequency.toLowerCase()} trong tuần này.`,
        'Ghi lại một takeaway rõ ràng sau mỗi lượt luyện.',
      ],
    }
  }

  return {
    headline:
      recommendation.targetGap <= 0.3
        ? 'Giữ vững band hiện tại'
        : `Thu hẹp khoảng cách tới Band ${goals.targetBand.toFixed(1)}`,
    summary:
      recommendation.targetGap <= 0.3
        ? `Các phiên gần đây đã sát mục tiêu. Giữ nhịp ${goals.studyFrequency.toLowerCase()} và tiếp tục xử lý điểm yếu lặp lại.`
        : `Trung bình ${Math.min(entries.length, 3)} phiên Writing gần nhất là ${recommendation.recentAverage.toFixed(1)}, còn cách mục tiêu ${recommendation.targetGap.toFixed(1)} band.`,
    actions: [
      entries[0]?.priorities[0] ??
        `Hoàn tất thêm một phiên ${goals.focusSkill} trong tuần này.`,
      recommendation.recurringPriority ??
        'Tiếp tục review các điểm yếu lặp lại theo rubric.',
      `Giữ nhịp học ${goals.studyFrequency.toLowerCase()}.`,
    ],
  }
}

type DashboardOverviewProps = {
  language?: AppLanguage
  learnerAvatarUrl?: string | null
  learnerGoals: LearnerGoals
  learnerName: string
  initialEntries?: WritingHistoryEntry[]
}

export function DashboardOverview({
  language = 'en',
  learnerAvatarUrl = null,
  learnerGoals,
  learnerName,
  initialEntries = [],
}: DashboardOverviewProps) {
  useEffect(() => {
    if (initialEntries.length) {
      hydrateWritingHistory(initialEntries)
    }
  }, [initialEntries])

  const entries = useSyncExternalStore(
    subscribeToWritingHistory,
    getWritingHistorySnapshot,
    () =>
      initialEntries.length
        ? initialEntries
        : getServerWritingHistorySnapshot()
  )
  const recentPracticeAttempts = useSyncExternalStore(
    subscribeToPracticeAttemptHistory,
    getPracticeAttemptHistorySnapshot,
    getServerPracticeAttemptHistorySnapshot
  )

  const copy = dashboardCopy[language]
  const latestSession = latestEntry(entries)
  const recentSessions = recentEntries(entries, 3)
  const recommendation = createStudyRecommendation(learnerGoals, entries)
  const skillPlan = createSkillPracticePlan(learnerGoals, entries)
  const focusModule = getSkillModuleDisplay(language, skillPlan.focusModule)
  const recommendationDisplay = getRecommendationDisplay(
    language,
    recommendation,
    learnerGoals,
    entries
  )

  return (
    <div className="dashboard-stack">
      <section className="glass dashboard-hero-panel">
        <div className="dashboard-hero-copy">
          <p className="section-label">{copy.sectionLabel}</p>
          <h1>{copy.heading(learnerName)}</h1>
          <p>{copy.intro}</p>
          <div className="hero-badge-row">
            <span className="hero-badge">
              {copy.targetBand} {learnerGoals.targetBand.toFixed(1)}
            </span>
            <span className="hero-badge">{learnerGoals.focusSkill}</span>
            <span className="hero-badge">{learnerGoals.studyFrequency}</span>
          </div>
          <div className="dashboard-hero-actions">
            <Link href={skillPlan.focusModule.href} className="primary-button">
              {copy.startSprint}
            </Link>
            <Link href="/settings/profile" className="secondary-button">
              {copy.updateGoals}
            </Link>
          </div>
        </div>

        <div className="dashboard-hero-side">
          <div className="dashboard-user-actions">
            <UserAvatar avatarUrl={learnerAvatarUrl} name={learnerName} />
            <form action={signout}>
              <button type="submit" className="secondary-button">
                {copy.signOut}
              </button>
            </form>
          </div>
          <article className="mission-card" aria-label={copy.missionCardLabel}>
            <div className="mission-orbit" aria-hidden="true">
              <span className="mission-orbit-dot" />
              <span className="mission-orbit-dot" />
              <span className="mission-orbit-dot" />
            </div>
            <span className="surface-kicker">{copy.missionKicker}</span>
            <h2>{copy.missionTitle(focusModule.title)}</h2>
            <p>{copy.missionBody(entries.length, focusModule.title)}</p>
            <div className="mission-metrics">
              <div className="mission-metric">
                <span className="metric-label">{copy.latestCheckpoint}</span>
                <strong>
                  {latestSession
                    ? latestSession.estimatedBand.toFixed(1)
                    : copy.noCheckpoint}
                </strong>
              </div>
              <div className="mission-metric">
                <span className="metric-label">{copy.focusSkill}</span>
                <strong>{skillPlan.focusModule.skill}</strong>
              </div>
              <div className="mission-metric">
                <span className="metric-label">{copy.nextModule}</span>
                <strong>{focusModule.title}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>

      <div className="dashboard-grid dashboard-metrics">
        <div className="glass dashboard-card dashboard-metric-card">
          <div className="dashboard-section-header">
            <div>
              <span className="surface-kicker">{copy.learningPath}</span>
              <h2 className="card-title icon-heading">
                <TargetIcon className="section-icon" />
                <span>{copy.targetBand}</span>
              </h2>
              <p className="dashboard-stat">{learnerGoals.targetBand.toFixed(1)}</p>
            </div>
            <Link href="/settings/profile" className="inline-link">
              {copy.updateGoals}
            </Link>
          </div>
          <p>{copy.goalsSnapshot(learnerGoals)}</p>
        </div>
        <div className="glass dashboard-card dashboard-metric-card">
          <span className="surface-kicker">{copy.momentum}</span>
          <h2 className="card-title icon-heading">
            <SparklesIcon className="section-icon" />
            <span>{copy.averageBand}</span>
          </h2>
          <p className="dashboard-stat">{averageBand(entries).toFixed(1)}</p>
          <p>{copy.averageDescription}</p>
        </div>
        <div className="glass dashboard-card dashboard-metric-card">
          <span className="surface-kicker">{copy.bestSnapshot}</span>
          <h2 className="card-title icon-heading">
            <TrophyIcon className="section-icon" />
            <span>{copy.bestResult}</span>
          </h2>
          <p className="dashboard-stat">{bestBand(entries).toFixed(1)}</p>
          <p>{copy.bestDescription(entries.length)}</p>
        </div>
      </div>

      <section className="glass dashboard-card skill-practice-panel">
        <div className="dashboard-section-header">
          <div>
            <span className="surface-kicker">{copy.practiceRoute}</span>
            <h2 className="card-title icon-heading">
              <CompassIcon className="section-icon" />
              <span>{copy.practiceMixTitle}</span>
            </h2>
            <p>{copy.practiceSummary(focusModule.title)}</p>
          </div>
          <Link href={skillPlan.focusModule.href} className="inline-link">
            {copy.openFocusWorkspace}
          </Link>
        </div>

        <div className="skill-practice-grid">
          {skillPlan.modules.map((module) => {
            const moduleDisplay = getSkillModuleDisplay(language, module)
            const isFocusModule = module.skill === skillPlan.focusModule.skill

            return (
              <Link
                key={module.skill}
                href={module.href}
                className={`skill-practice-card${isFocusModule ? ' is-focus' : ''}`}
                aria-label={copy.openPracticeModule(moduleDisplay.title)}
              >
                <div className="skill-practice-card-header">
                  <span className="skill-practice-mark" aria-hidden="true">
                    {module.shortLabel}
                  </span>
                  <span className="surface-kicker">{moduleDisplay.skill}</span>
                  {isFocusModule ? (
                    <span className="skill-focus-badge">{copy.currentFocus}</span>
                  ) : null}
                </div>
                <h3>{moduleDisplay.title}</h3>
                <p>{moduleDisplay.description}</p>
                <span className="metric-label">
                  {copy.minutes(module.recommendedMinutes)} |{' '}
                  {getSkillEvidence(language, module.skill, module.evidence)}
                </span>
              </Link>
            )
          })}
        </div>

        <div className="skill-practice-mix" aria-label={copy.weeklyMixLabel}>
          {skillPlan.weeklyMix.map((item) => (
            <Link key={item.skill} href={item.href} className="skill-practice-chip">
              <span>{item.skill}</span>
              <strong>
                {copy.sessionCount(item.sessions)}
              </strong>
            </Link>
          ))}
        </div>
      </section>

      <PracticeAttemptHistoryPanel
        attempts={recentPracticeAttempts}
        title={copy.recentSkillAttemptsTitle}
        description={copy.recentSkillAttemptsDescription}
        showSkillLabel
      />

      <div className="dashboard-grid dashboard-content">
        <section className="glass dashboard-card">
          <div className="dashboard-section-header">
            <div>
              <h2 className="card-title icon-heading">
                <SparklesIcon className="section-icon" />
                <span>{copy.recentActivity}</span>
              </h2>
              <p>{copy.recentActivityDescription}</p>
            </div>
            <Link href="/tracker" className="inline-link">
              {copy.openTracker}
            </Link>
          </div>

          {recentSessions.length ? (
            <div className="dashboard-activity-feed">
              {recentSessions.map((entry) => (
                <article key={entry.id} className="activity-card">
                  <div className="history-kicker-row">
                    <span className="surface-kicker">{copy.latestCheckpoint}</span>
                    <span className="surface-kicker">{entry.taskType}</span>
                    <span className="surface-kicker dashboard-activity-pill">
                      {copy.activityWords(entry.wordCount)}
                    </span>
                  </div>
                  <div className="activity-card-header">
                    <div>
                      <h3>{entry.promptTitle}</h3>
                    </div>
                    <strong className="activity-score">
                      {entry.estimatedBand.toFixed(1)}
                    </strong>
                  </div>
                  <div className="history-meta">
                    <span>{formatDate(entry.createdAt, language)}</span>
                    <span>{copy.activityWords(entry.wordCount)}</span>
                  </div>
                  <div className="history-kicker-row">
                    <span className="surface-kicker dashboard-activity-pill">
                      {copy.nextFocus}
                    </span>
                  </div>
                  <p>{entry.priorities[0] ?? 'Keep refining your structure and support.'}</p>
                  <Link href={`/tracker/${entry.id}`} className="inline-link">
                    {copy.openDetail}
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-dashboard-state">
              <p className="surface-kicker">{copy.firstCheckpoint}</p>
              <h3>{copy.noActivity}</h3>
              <p>{copy.noActivityDescription}</p>
              <div className="empty-state-helper-strip">
                <span className="surface-kicker">{copy.suggestedStart}</span>
                <p>{copy.suggestedStartDescription}</p>
              </div>
              <Link href={skillPlan.focusModule.href} className="primary-button">
                {focusModule.actionLabel}
              </Link>
            </div>
          )}
        </section>

        <section className="glass dashboard-card">
          <div className="dashboard-section-header">
            <div>
              <h2 className="card-title icon-heading">
                <ChecklistIcon className="section-icon" />
                <span>{copy.nextBestStep}</span>
              </h2>
              <p>{copy.nextBestStepDescription}</p>
            </div>
            <Link href={skillPlan.focusModule.href} className="inline-link">
              {copy.openFocusModuleLink}
            </Link>
          </div>

          <div className="next-step-stack">
            <div className="metric-pill">
              <span className="metric-label">{copy.focusSkill}</span>
              <strong>{focusModule.title}</strong>
            </div>
            <div className="metric-pill">
              <span className="metric-label">{copy.recommendation}</span>
              <strong>{recommendationDisplay.headline}</strong>
            </div>
            <div className="summary-grid">
              <div className="summary-box">
                <span className="surface-kicker">{copy.now}</span>
                <span className="metric-label">{copy.recentAverage}</span>
                <strong>{recommendation.recentAverage.toFixed(1)}</strong>
              </div>
              <div className="summary-box">
                <span className="surface-kicker">{copy.gap}</span>
                <span className="metric-label">{copy.targetGap}</span>
                <strong>{recommendation.targetGap.toFixed(1)}</strong>
              </div>
              <div className="summary-box">
                <span className="surface-kicker">{copy.rhythm}</span>
                <span className="metric-label">{copy.sessionsThisWeek}</span>
                <strong>{recommendation.sessionsThisWeek}</strong>
              </div>
            </div>
            <p>{recommendationDisplay.summary}</p>
          </div>

          {latestSession ? (
            <div className="next-step-stack">
              <div className="metric-pill">
                <span className="metric-label">{copy.latestPrompt}</span>
                <strong>{latestSession.promptTitle}</strong>
              </div>
              <div className="metric-pill">
                <span className="metric-label">{copy.taskBalance}</span>
                <strong>
                  Task 1: {countTaskType(entries, 'Task 1')} | Task 2:{' '}
                  {countTaskType(entries, 'Task 2')}
                </strong>
              </div>
              <div className="metric-pill">
                <span className="metric-label">{copy.studyRhythm}</span>
                <strong>{learnerGoals.studyFrequency}</strong>
              </div>
              {recommendation.recurringPriority ? (
                <div className="metric-pill">
                  <span className="metric-label">{copy.recurringFocus}</span>
                  <strong>{recommendation.recurringPriority}</strong>
                </div>
              ) : null}
              <div className="feedback-section no-divider">
                <span className="surface-kicker">{copy.currentPriority}</span>
                <h3>{copy.priorityRightNow}</h3>
                <ul className="bullet-list compact-list">
                  {recommendationDisplay.actions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="empty-dashboard-state">
              <p className="surface-kicker">{copy.buildMomentum}</p>
              <p>{copy.buildMomentumDescription(learnerGoals)}</p>
              <div className="empty-state-helper-strip">
                <span className="surface-kicker">{copy.firstRecommendation}</span>
                <p>{copy.firstRecommendationDescription(focusModule.title)}</p>
              </div>
              <div className="hero-badge-row">
                <span className="hero-badge">{copy.firstReview}</span>
                <span className="hero-badge">{copy.dashboardInsight}</span>
              </div>
              <ul className="bullet-list compact-list">
                {recommendationDisplay.actions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href={skillPlan.focusModule.href} className="primary-button">
                {copy.openSkillFocusModule(skillPlan.focusModule.skill)}
              </Link>
              <Link href="/settings/profile" className="inline-link">
                {copy.refineGoals}
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
