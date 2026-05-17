'use client'

import { useState } from 'react'
import { LoginForm } from '@/app/auth/_components/login-form'
import type { AppLanguage } from '@/lib/i18n/app-language'

const welcomeCopy: Record<
  AppLanguage,
  {
    eyebrow: string
    heading: string
    intro: string
    login: string
    about: string
    targetLabel: string
    todayLabel: string
    sprintTitle: string
    practiceSteps: string[]
    nextStepLabel: string
    nextStep: string
    aboutEyebrow: string
    aboutTitle: string
    aboutBody: string
    aboutHighlights: Array<{
      label: string
      title: string
      body: string
    }>
    aboutLoopTitle: string
    aboutLoopSteps: string[]
    aboutMetricLabel: string
    aboutMetricValue: string
    aboutMetricNote: string
    authEyebrow: string
    authTitle: string
    closeLogin: string
  }
> = {
  vi: {
    eyebrow: 'Lumina IELTS',
    heading: 'Luyện IELTS nhẹ nhàng, có lộ trình và thấy rõ tiến bộ.',
    intro:
      'Không gian học tập cá nhân giúp bạn tập trung vào bước tiếp theo, giảm nhiễu trên màn hình và giữ nhịp luyện tập đều hơn.',
    login: 'Đăng nhập',
    about: 'Về Lumina',
    targetLabel: 'Mục tiêu band',
    todayLabel: 'Hôm nay',
    sprintTitle: 'Focus sprint',
    practiceSteps: ['Đọc', 'Nói', 'Sửa bài'],
    nextStepLabel: 'Bước tiếp theo',
    nextStep: 'Writing rewrite',
    aboutEyebrow: 'Về Lumina',
    aboutTitle: 'Lumina giúp bạn học dễ bắt đầu hơn.',
    aboutBody:
      'Thay vì mở quá nhiều công cụ cùng lúc, Lumina gom việc luyện IELTS thành một vòng học ngắn: biết mục tiêu, luyện có trọng tâm, nhận tín hiệu tiến bộ, rồi quay lại bước tiếp theo.',
    aboutHighlights: [
      {
        label: '01',
        title: 'Tập trung trước',
        body: 'Mỗi lần vào app chỉ cần chọn một sprint nhỏ thay vì đọc một dashboard dài.',
      },
      {
        label: '02',
        title: 'Có feedback loop',
        body: 'Writing, Reading, Listening và Speaking đều hướng về practice, feedback, revision.',
      },
      {
        label: '03',
        title: 'Thấy tiến bộ',
        body: 'Band, checkpoint và next step được gom lại để bạn biết mình đang đi đúng hướng.',
      },
    ],
    aboutLoopTitle: 'Vòng học Lumina',
    aboutLoopSteps: ['Chọn trọng tâm', 'Luyện một sprint', 'Review feedback', 'Quay lại tốt hơn'],
    aboutMetricLabel: 'Thiết kế cho',
    aboutMetricValue: '1 learner',
    aboutMetricNote: 'Không mạng xã hội, không leaderboard, không nhiễu.',
    authEyebrow: 'Xác thực',
    authTitle: 'Đăng nhập Lumina IELTS',
    closeLogin: 'Đóng cửa sổ đăng nhập',
  },
  en: {
    eyebrow: 'Lumina IELTS',
    heading: 'Practice IELTS with calm focus and visible progress.',
    intro:
      'A personal study space for learners who want clearer practice, lighter screens, and a next step that never feels hidden.',
    login: 'Log In',
    about: 'About Us',
    targetLabel: 'Band target',
    todayLabel: 'Today',
    sprintTitle: 'Focus sprint',
    practiceSteps: ['Read', 'Speak', 'Review'],
    nextStepLabel: 'Next step',
    nextStep: 'Writing rewrite',
    aboutEyebrow: 'About Lumina',
    aboutTitle: 'Lumina makes practice easier to start.',
    aboutBody:
      'Instead of opening too many tools at once, Lumina turns IELTS prep into a short loop: know the target, practice with focus, read the progress signal, then return to the next step.',
    aboutHighlights: [
      {
        label: '01',
        title: 'Focus first',
        body: 'Each visit starts with one small sprint instead of a long dashboard to decode.',
      },
      {
        label: '02',
        title: 'Feedback loop',
        body: 'Writing, Reading, Listening, and Speaking all lead back to practice, feedback, revision.',
      },
      {
        label: '03',
        title: 'Visible progress',
        body: 'Bands, checkpoints, and next steps are grouped so learners can see momentum.',
      },
    ],
    aboutLoopTitle: 'Lumina learning loop',
    aboutLoopSteps: ['Pick focus', 'Practice one sprint', 'Review feedback', 'Return sharper'],
    aboutMetricLabel: 'Designed for',
    aboutMetricValue: '1 learner',
    aboutMetricNote: 'No social feed, no leaderboard, no noise.',
    authEyebrow: 'Authentication',
    authTitle: 'Log in to Lumina IELTS',
    closeLogin: 'Close login dialog',
  },
}

type WelcomeExperienceProps = {
  demoCredentials?: {
    admin: {
      email: string
      password: string
    }
    learner: {
      email: string
      password: string
    }
  }
  initialLanguage?: AppLanguage
  initialLoginOpen?: boolean
}

export function WelcomeExperience({
  demoCredentials,
  initialLanguage = 'vi',
  initialLoginOpen = false,
}: WelcomeExperienceProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(initialLoginOpen)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [language, setLanguage] = useState<AppLanguage>(initialLanguage)
  const copy = welcomeCopy[language]

  async function updateLanguage(nextLanguage: AppLanguage) {
    setLanguage(nextLanguage)

    await fetch('/api/preferences/language', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: nextLanguage,
      }),
    })
  }

  return (
    <main className="welcome-shell">
      <div className="welcome-orb welcome-orb-one" aria-hidden="true" />
      <div className="welcome-orb welcome-orb-two" aria-hidden="true" />
      <div className="language-toggle" aria-label="Language selector">
        <button
          type="button"
          className={language === 'vi' ? 'is-active' : ''}
          onClick={() => {
            void updateLanguage('vi')
          }}
        >
          VI
        </button>
        <button
          type="button"
          className={language === 'en' ? 'is-active' : ''}
          onClick={() => {
            void updateLanguage('en')
          }}
        >
          EN
        </button>
      </div>
      <section className="welcome-hero">
        <div className="welcome-copy">
          <p className="section-label">{copy.eyebrow}</p>
          <h1>{copy.heading}</h1>
          <p>{copy.intro}</p>
          <div className="welcome-actions">
            <button
              type="button"
              className="primary-button welcome-primary-action"
              onClick={() => setIsLoginOpen(true)}
            >
              {copy.login}
            </button>
            <button
              type="button"
              className="secondary-button welcome-secondary-action"
              aria-controls="welcome-about-panel"
              aria-expanded={isAboutOpen}
              onClick={() => setIsAboutOpen((current) => !current)}
            >
              {copy.about}
            </button>
          </div>
        </div>

        <div className="welcome-showcase" aria-label="Lumina IELTS study preview">
          <div className="welcome-score-card welcome-float-card">
            <span>{copy.targetLabel}</span>
            <strong>7.5</strong>
          </div>
          <div className="welcome-path-card">
            <span className="surface-kicker">{copy.todayLabel}</span>
            <h2>{copy.sprintTitle}</h2>
            <div className="welcome-progress-line" />
            <div className="welcome-path-grid">
              {copy.practiceSteps.map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
          </div>
          <div className="welcome-spark-card welcome-float-card">
            <span>{copy.nextStepLabel}</span>
            <strong>{copy.nextStep}</strong>
          </div>
        </div>
      </section>

      {isAboutOpen ? (
        <section
          id="welcome-about-panel"
          className="welcome-about-experience glass"
        >
          <div className="welcome-about-copy">
            <span className="surface-kicker">{copy.aboutEyebrow}</span>
            <h2>{copy.aboutTitle}</h2>
            <p>{copy.aboutBody}</p>
          </div>

          <div className="welcome-about-grid">
            {copy.aboutHighlights.map((item) => (
              <article key={item.label} className="welcome-about-highlight">
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <div className="welcome-about-loop">
            <div>
              <span className="surface-kicker">{copy.aboutLoopTitle}</span>
              <div className="welcome-about-loop-steps">
                {copy.aboutLoopSteps.map((step, index) => (
                  <span key={step}>
                    <strong>{index + 1}</strong>
                    {step}
                  </span>
                ))}
              </div>
            </div>
            <aside className="welcome-about-metric">
              <span>{copy.aboutMetricLabel}</span>
              <strong>{copy.aboutMetricValue}</strong>
              <p>{copy.aboutMetricNote}</p>
            </aside>
          </div>
        </section>
      ) : null}

      {isLoginOpen ? (
        <div className="welcome-dialog-backdrop" role="presentation">
          <section
            aria-modal="true"
            className="glass welcome-login-dialog"
            role="dialog"
            aria-labelledby="welcome-login-title"
          >
            <button
              type="button"
              className="welcome-dialog-close"
              aria-label={copy.closeLogin}
              onClick={() => setIsLoginOpen(false)}
            >
              X
            </button>
            <div className="auth-copy compact-auth-copy">
              <p className="section-label">{copy.authEyebrow}</p>
              <h2 id="welcome-login-title">{copy.authTitle}</h2>
            </div>
            <LoginForm
              demoCredentials={demoCredentials}
              language={language}
            />
          </section>
        </div>
      ) : null}
    </main>
  )
}
